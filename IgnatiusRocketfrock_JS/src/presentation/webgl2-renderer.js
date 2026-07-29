const FLOATS_PER_VERTEX = 8;
const VERTICES_PER_QUAD = 6;
const DEFAULT_INITIAL_QUADS = 1024;
const MASK_FLOATS_PER_VERTEX = 3;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp01(value) {
    return Math.max(0, Math.min(1, finiteNumber(value, 0)));
}

function webglErrorName(gl, code) {
    if (!code || code === gl.NO_ERROR) return "NO_ERROR";
    const names = [
        "INVALID_ENUM",
        "INVALID_VALUE",
        "INVALID_OPERATION",
        "INVALID_FRAMEBUFFER_OPERATION",
        "OUT_OF_MEMORY",
        "CONTEXT_LOST_WEBGL"
    ];
    for (const name of names) {
        if (gl[name] === code) return name;
    }
    return `WebGL error ${code}`;
}

function parseCssColor(value, fallback = [1, 1, 1, 1]) {
    const text = String(value || "").trim();
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
    if (hex) {
        let digits = hex[1];
        if (digits.length === 3) {
            digits = digits.split("").map((digit) => `${digit}${digit}`).join("");
        }
        const hasAlpha = digits.length === 8;
        return [
            parseInt(digits.slice(0, 2), 16) / 255,
            parseInt(digits.slice(2, 4), 16) / 255,
            parseInt(digits.slice(4, 6), 16) / 255,
            hasAlpha ? parseInt(digits.slice(6, 8), 16) / 255 : 1
        ];
    }
    const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(text);
    if (rgb) {
        return [
            clamp01(Number(rgb[1]) / 255),
            clamp01(Number(rgb[2]) / 255),
            clamp01(Number(rgb[3]) / 255),
            rgb[4] === undefined ? 1 : clamp01(Number(rgb[4]))
        ];
    }
    return [...fallback];
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("WebGL2 could not allocate a shader.");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader) || "Unknown shader compilation error";
        gl.deleteShader(shader);
        throw new Error(`WebGL2 shader compilation failed: ${log}`);
    }
    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error("WebGL2 could not allocate a program.");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program) || "Unknown program link error";
        gl.deleteProgram(program);
        throw new Error(`WebGL2 program link failed: ${log}`);
    }
    return program;
}

function sourceDimensions(source) {
    return {
        width: Math.max(1, Math.floor(finiteNumber(source?.videoWidth ?? source?.naturalWidth ?? source?.width, 1))),
        height: Math.max(1, Math.floor(finiteNumber(source?.videoHeight ?? source?.naturalHeight ?? source?.height, 1)))
    };
}

function appendVertex(target, offset, x, y, u, v, color) {
    target[offset] = x;
    target[offset + 1] = y;
    target[offset + 2] = u;
    target[offset + 3] = v;
    target[offset + 4] = color[0];
    target[offset + 5] = color[1];
    target[offset + 6] = color[2];
    target[offset + 7] = color[3];
}

export function canUseWebGL2(canvas) {
    if (!canvas?.getContext) return false;
    try {
        return Boolean(canvas.getContext("webgl2", {
            alpha: false,
            antialias: true,
            depth: false,
            stencil: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance",
            desynchronized: false
        }));
    } catch {
        return false;
    }
}

export class WebGL2RendererBackend {
    constructor(canvas, gl) {
        if (!canvas || !gl) throw new Error("WebGL2RendererBackend requires a canvas and WebGL2 context.");
        this.canvas = canvas;
        this.gl = gl;
        this.stencilAvailable = typeof gl.getContextAttributes !== "function" || gl.getContextAttributes()?.stencil !== false;
        this.available = true;
        this.contextLost = false;
        this.maxTextureDimension = typeof gl.getParameter === "function"
            ? Math.max(1, Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 1)
            : 32767;
        this.textureCache = new WeakMap();
        this.textureRecords = new Set();
        this.pinnedSources = new Set();
        this.lastTextureError = "";
        this.frameId = 0;
        this.currentTextureRecord = null;
        this.quadCapacity = DEFAULT_INITIAL_QUADS;
        this.vertexData = new Float32Array(this.quadCapacity * VERTICES_PER_QUAD * FLOATS_PER_VERTEX);
        this.vertexFloatCount = 0;
        this.frameDiagnostics = this.createFrameDiagnostics();
        this.currentBlendMode = "alpha";
        this.caveMaskGeometryKey = "";
        this.caveMaskGradientVertexCount = 0;
        this.caveMaskStencilVertexCount = 0;
        this.totalDiagnostics = {
            contextRestores: 0,
            contextLosses: 0
        };
        this.resourceGeneration = 1;
        this.initializeResources();
        this.installContextHandlers();
    }

    createFrameDiagnostics() {
        return {
            backend: "webgl2-resident",
            drawCalls: 0,
            quads: 0,
            textureUploads: 0,
            textureUpdates: 0,
            canvasLayerUploads: 0,
            staticTextureCount: this.textureRecords?.size || 0,
            residentTextureBytes: this.estimatedTextureBytes?.() || 0,
            contextLost: Boolean(this.contextLost)
        };
    }

    installContextHandlers() {
        if (!this.canvas?.addEventListener) return;
        this.canvas.addEventListener("webglcontextlost", (event) => {
            event.preventDefault?.();
            this.contextLost = true;
            this.available = false;
            this.totalDiagnostics.contextLosses += 1;
        });
        this.canvas.addEventListener("webglcontextrestored", () => {
            this.contextLost = false;
            this.textureCache = new WeakMap();
            this.textureRecords.clear();
            this.initializeResources();
            this.resourceGeneration += 1;
            this.available = true;
            for (const source of this.pinnedSources) {
                this.textureRecord(source, false, false);
            }
            this.totalDiagnostics.contextRestores += 1;
        });
    }

    initializeResources() {
        const gl = this.gl;
        const vertexSource = `#version 300 es
            precision highp float;
            in vec2 a_position;
            in vec2 a_uv;
            in vec4 a_color;
            uniform vec2 u_resolution;
            out vec2 v_uv;
            out vec4 v_color;
            void main() {
                vec2 clip = vec2(
                    a_position.x / u_resolution.x * 2.0 - 1.0,
                    1.0 - a_position.y / u_resolution.y * 2.0
                );
                gl_Position = vec4(clip, 0.0, 1.0);
                v_uv = a_uv;
                v_color = a_color;
            }
        `;
        const fragmentSource = `#version 300 es
            precision mediump float;
            uniform sampler2D u_texture;
            in vec2 v_uv;
            in vec4 v_color;
            out vec4 outColor;
            void main() {
                vec4 texel = texture(u_texture, v_uv);
                outColor = vec4(
                    texel.rgb * v_color.rgb * v_color.a,
                    texel.a * v_color.a
                );
            }
        `;
        this.program = createProgram(gl, vertexSource, fragmentSource);
        this.positionLocation = gl.getAttribLocation(this.program, "a_position");
        this.uvLocation = gl.getAttribLocation(this.program, "a_uv");
        this.colorLocation = gl.getAttribLocation(this.program, "a_color");
        this.resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");
        this.textureLocation = gl.getUniformLocation(this.program, "u_texture");
        this.vertexArray = gl.createVertexArray();
        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexArray || !this.vertexBuffer) {
            throw new Error("WebGL2 could not allocate sprite-batch buffers.");
        }
        gl.bindVertexArray(this.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);
        const stride = FLOATS_PER_VERTEX * 4;
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(this.uvLocation);
        gl.vertexAttribPointer(this.uvLocation, 2, gl.FLOAT, false, stride, 2 * 4);
        gl.enableVertexAttribArray(this.colorLocation);
        gl.vertexAttribPointer(this.colorLocation, 4, gl.FLOAT, false, stride, 4 * 4);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        const whiteSource = new Uint8Array([255, 255, 255, 255]);
        const texture = gl.createTexture();
        if (!texture) throw new Error("WebGL2 could not allocate the solid-color texture.");
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whiteSource);
        this.whiteTextureRecord = { texture, width: 1, height: 1, source: null, dynamic: false };
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.initializeCaveMaskResources();
    }

    initializeCaveMaskResources() {
        const gl = this.gl;
        const vertexSource = `#version 300 es
            precision highp float;
            in vec2 a_world_position;
            in float a_alpha;
            uniform vec2 u_resolution;
            uniform vec2 u_view_origin;
            uniform vec2 u_parallax_offset;
            uniform float u_zoom;
            out float v_alpha;
            void main() {
                vec2 screen = (a_world_position - u_view_origin - u_parallax_offset) * u_zoom;
                vec2 clip = vec2(
                    screen.x / u_resolution.x * 2.0 - 1.0,
                    1.0 - screen.y / u_resolution.y * 2.0
                );
                gl_Position = vec4(clip, 0.0, 1.0);
                v_alpha = a_alpha;
            }
        `;
        const fragmentSource = `#version 300 es
            precision mediump float;
            in float v_alpha;
            out vec4 outColor;
            void main() {
                outColor = vec4(0.0, 0.0, 0.0, clamp(v_alpha, 0.0, 1.0));
            }
        `;
        this.caveMaskProgram = createProgram(gl, vertexSource, fragmentSource);
        this.caveMaskPositionLocation = gl.getAttribLocation(this.caveMaskProgram, "a_world_position");
        this.caveMaskAlphaLocation = gl.getAttribLocation(this.caveMaskProgram, "a_alpha");
        this.caveMaskResolutionLocation = gl.getUniformLocation(this.caveMaskProgram, "u_resolution");
        this.caveMaskViewOriginLocation = gl.getUniformLocation(this.caveMaskProgram, "u_view_origin");
        this.caveMaskParallaxLocation = gl.getUniformLocation(this.caveMaskProgram, "u_parallax_offset");
        this.caveMaskZoomLocation = gl.getUniformLocation(this.caveMaskProgram, "u_zoom");
        this.caveMaskVertexArray = gl.createVertexArray();
        this.caveMaskGradientBuffer = gl.createBuffer();
        this.caveMaskStencilBuffer = gl.createBuffer();
        this.caveMaskFullscreenBuffer = gl.createBuffer();
        if (!this.caveMaskVertexArray || !this.caveMaskGradientBuffer || !this.caveMaskStencilBuffer || !this.caveMaskFullscreenBuffer) {
            throw new Error("WebGL2 could not allocate cave-mask geometry buffers.");
        }
        this.caveMaskGeometryKey = "";
        this.caveMaskGradientVertexCount = 0;
        this.caveMaskStencilVertexCount = 0;
    }

    dispose() {
        const gl = this.gl;
        this.flush();
        for (const record of this.textureRecords) {
            gl.deleteTexture(record.texture);
        }
        this.textureRecords.clear();
        if (this.whiteTextureRecord?.texture) gl.deleteTexture(this.whiteTextureRecord.texture);
        if (this.caveMaskGradientBuffer) gl.deleteBuffer(this.caveMaskGradientBuffer);
        if (this.caveMaskStencilBuffer) gl.deleteBuffer(this.caveMaskStencilBuffer);
        if (this.caveMaskFullscreenBuffer) gl.deleteBuffer(this.caveMaskFullscreenBuffer);
        if (this.caveMaskVertexArray) gl.deleteVertexArray(this.caveMaskVertexArray);
        if (this.caveMaskProgram) gl.deleteProgram(this.caveMaskProgram);
        if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
        if (this.vertexArray) gl.deleteVertexArray(this.vertexArray);
        if (this.program) gl.deleteProgram(this.program);
        this.available = false;
    }

    resetTextures(options = {}) {
        this.flush();
        const preservePinned = options.preservePinned !== false;
        const gl = this.gl;
        for (const record of this.textureRecords) {
            gl.deleteTexture(record.texture);
        }
        this.textureRecords.clear();
        this.textureCache = new WeakMap();
        if (!preservePinned) {
            this.pinnedSources.clear();
            return;
        }
        for (const source of this.pinnedSources) {
            this.textureRecord(source, false, false);
        }
    }

    replacePinnedTextures(sources = []) {
        this.resetTextures({ preservePinned: false });
        return this.preloadTextures(sources);
    }

    preloadTexture(source) {
        if (!source || !this.available || this.contextLost) return false;
        this.pinnedSources.add(source);
        return Boolean(this.textureRecord(source, false, false));
    }

    cacheTexture(source) {
        if (!source || !this.available || this.contextLost) return false;
        return Boolean(this.textureRecord(source, false, false));
    }

    getResourceGeneration() {
        return Math.max(1, Number(this.resourceGeneration) || 1);
    }

    createTextureStorage(width, height) {
        if (!this.available || this.contextLost) return null;
        const safeWidth = Math.max(1, Math.floor(finiteNumber(width, 1)));
        const safeHeight = Math.max(1, Math.floor(finiteNumber(height, 1)));
        const maxTextureSize = this.getMaxTextureSize();
        this.lastTextureError = "";
        if (safeWidth > maxTextureSize || safeHeight > maxTextureSize) {
            this.lastTextureError = `WebGL2 texture storage ${safeWidth}x${safeHeight} exceeds max texture size ${maxTextureSize}.`;
            return null;
        }
        const gl = this.gl;
        const texture = gl.createTexture();
        if (!texture) {
            this.lastTextureError = "WebGL2 could not allocate a texture object for tile storage.";
            return null;
        }
        const source = { width: safeWidth, height: safeHeight, tileTextureStorage: true };
        const record = {
            texture,
            source,
            width: safeWidth,
            height: safeHeight,
            dynamic: false,
            uploadedFrame: this.frameId
        };
        try {
            this.flush();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, safeWidth, safeHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            const errorCode = typeof gl.getError === "function" ? gl.getError() : gl.NO_ERROR;
            if (errorCode && errorCode !== gl.NO_ERROR) {
                throw new Error(`WebGL2 tile texture allocation failed: ${webglErrorName(gl, errorCode)} for ${safeWidth}x${safeHeight}.`);
            }
            this.frameDiagnostics.textureUploads += 1;
            this.textureCache.set(source, record);
            this.textureRecords.add(record);
            return source;
        } catch (error) {
            this.lastTextureError = error?.message || String(error || "WebGL2 tile texture allocation failed.");
            gl.deleteTexture(texture);
            return null;
        } finally {
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    updateTextureRegion(source, image, x = 0, y = 0, options = {}) {
        if (!source || !image || !this.available || this.contextLost) return false;
        const record = this.textureCache.get(source);
        if (!record) {
            this.lastTextureError = "WebGL2 tile texture storage is no longer resident.";
            return false;
        }
        const dimensions = sourceDimensions(image);
        const safeX = Math.max(0, Math.floor(finiteNumber(x, 0)));
        const safeY = Math.max(0, Math.floor(finiteNumber(y, 0)));
        if (safeX + dimensions.width > record.width || safeY + dimensions.height > record.height) {
            this.lastTextureError = `WebGL2 tile update ${dimensions.width}x${dimensions.height} at ${safeX},${safeY} exceeds ${record.width}x${record.height} storage.`;
            return false;
        }
        const gl = this.gl;
        this.lastTextureError = "";
        try {
            this.flush();
            gl.bindTexture(gl.TEXTURE_2D, record.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.unpackFlipY !== false);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            if (gl.UNPACK_COLORSPACE_CONVERSION_WEBGL !== undefined) {
                gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
            }
            const textureY = record.height - safeY - dimensions.height;
            gl.texSubImage2D(gl.TEXTURE_2D, 0, safeX, textureY, gl.RGBA, gl.UNSIGNED_BYTE, image);
            const errorCode = typeof gl.getError === "function" ? gl.getError() : gl.NO_ERROR;
            if (errorCode && errorCode !== gl.NO_ERROR) {
                throw new Error(`WebGL2 tile texture update failed: ${webglErrorName(gl, errorCode)}.`);
            }
            record.uploadedFrame = this.frameId;
            this.frameDiagnostics.textureUpdates += 1;
            return true;
        } catch (error) {
            this.lastTextureError = error?.message || String(error || "WebGL2 tile texture update failed.");
            return false;
        } finally {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            if (gl.UNPACK_COLORSPACE_CONVERSION_WEBGL !== undefined) {
                gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    preloadTextures(sources = []) {
        let loaded = 0;
        for (const source of sources) {
            if (this.preloadTexture(source)) loaded += 1;
        }
        return loaded;
    }

    refreshTexture(source) {
        if (!source || !this.available || this.contextLost) return false;
        return Boolean(this.textureRecord(source, true, true));
    }

    getMaxTextureSize() {
        return Math.max(1, Number(this.maxTextureDimension) || 1);
    }

    estimatedTextureBytes() {
        let bytes = 0;
        for (const record of this.textureRecords) {
            bytes += Math.max(1, record.width) * Math.max(1, record.height) * 4;
        }
        return bytes;
    }

    invalidateTexture(source) {
        if (!source) return false;
        const record = this.textureCache.get(source);
        if (!record) return false;
        this.flush();
        this.gl.deleteTexture(record.texture);
        this.textureRecords.delete(record);
        this.textureCache.delete(source);
        if (this.currentTextureRecord === record) {
            this.currentTextureRecord = null;
        }
        return true;
    }

    beginFrame(width, height, clearColor = "rgb(6, 6, 12)") {
        if (!this.available || this.contextLost) return false;
        this.frameId += 1;
        this.frameDiagnostics = this.createFrameDiagnostics();
        this.currentTextureRecord = null;
        this.vertexFloatCount = 0;
        const gl = this.gl;
        const safeWidth = Math.max(1, Math.floor(finiteNumber(width, this.canvas.width || 1)));
        const safeHeight = Math.max(1, Math.floor(finiteNumber(height, this.canvas.height || 1)));
        gl.viewport(0, 0, safeWidth, safeHeight);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.SCISSOR_TEST);
        if (gl.STENCIL_TEST !== undefined) gl.disable(gl.STENCIL_TEST);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        this.currentBlendMode = "alpha";
        this.applyBlendMode("alpha", true);
        const [r, g, b, a] = parseCssColor(clearColor, [6 / 255, 6 / 255, 12 / 255, 1]);
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.uniform2f(this.resolutionLocation, safeWidth, safeHeight);
        gl.uniform1i(this.textureLocation, 0);
        gl.activeTexture(gl.TEXTURE0);
        return true;
    }

    bindCaveMaskBuffer(buffer) {
        const gl = this.gl;
        gl.bindVertexArray(this.caveMaskVertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const stride = MASK_FLOATS_PER_VERTEX * 4;
        gl.enableVertexAttribArray(this.caveMaskPositionLocation);
        gl.vertexAttribPointer(this.caveMaskPositionLocation, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(this.caveMaskAlphaLocation);
        gl.vertexAttribPointer(this.caveMaskAlphaLocation, 1, gl.FLOAT, false, stride, 2 * 4);
    }

    uploadCaveMaskGeometry(geometry) {
        if (!geometry || !this.available || this.contextLost) return false;
        const key = String(geometry.key || "");
        if (key && key === this.caveMaskGeometryKey) return true;
        const gradientVertices = geometry.gradientVertices instanceof Float32Array
            ? geometry.gradientVertices
            : new Float32Array(geometry.gradientVertices || []);
        const stencilVertices = geometry.exteriorStencilVertices instanceof Float32Array
            ? geometry.exteriorStencilVertices
            : new Float32Array(geometry.exteriorStencilVertices || []);
        if (!stencilVertices.length) return false;
        this.flush();
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.caveMaskGradientBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gradientVertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.caveMaskStencilBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, stencilVertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.caveMaskGeometryKey = key;
        this.caveMaskGradientVertexCount = gradientVertices.length / MASK_FLOATS_PER_VERTEX;
        this.caveMaskStencilVertexCount = stencilVertices.length / MASK_FLOATS_PER_VERTEX;
        return true;
    }

    drawCaveMaskGeometry({
        geometry,
        width,
        height,
        viewX = 0,
        viewY = 0,
        zoom = 1,
        parallaxX = 0,
        parallaxY = 0
    } = {}) {
        const gl = this.gl;
        if (
            !this.available ||
            this.contextLost ||
            !geometry ||
            !this.stencilAvailable ||
            typeof gl.stencilFunc !== "function" ||
            typeof gl.stencilOp !== "function" ||
            typeof gl.colorMask !== "function"
        ) {
            return false;
        }
        if (!this.uploadCaveMaskGeometry(geometry)) return false;
        this.flush();

        const safeWidth = Math.max(1, finiteNumber(width, this.canvas.width || 1));
        const safeHeight = Math.max(1, finiteNumber(height, this.canvas.height || 1));
        const safeZoom = Math.max(0.0001, finiteNumber(zoom, 1));
        const originX = finiteNumber(viewX, 0);
        const originY = finiteNumber(viewY, 0);
        const offsetX = finiteNumber(parallaxX, 0);
        const offsetY = finiteNumber(parallaxY, 0);

        gl.useProgram(this.caveMaskProgram);
        gl.uniform2f(this.caveMaskResolutionLocation, safeWidth, safeHeight);
        gl.uniform2f(this.caveMaskViewOriginLocation, originX, originY);
        gl.uniform2f(this.caveMaskParallaxLocation, offsetX, offsetY);
        gl.uniform1f(this.caveMaskZoomLocation, safeZoom);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        if (this.caveMaskGradientVertexCount > 0) {
            this.bindCaveMaskBuffer(this.caveMaskGradientBuffer);
            gl.drawArrays(gl.TRIANGLES, 0, this.caveMaskGradientVertexCount);
            this.frameDiagnostics.drawCalls += 1;
        }

        gl.enable(gl.STENCIL_TEST);
        gl.clearStencil(0);
        gl.stencilMask(0xff);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.colorMask(false, false, false, false);
        gl.disable(gl.BLEND);
        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
        this.bindCaveMaskBuffer(this.caveMaskStencilBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, this.caveMaskStencilVertexCount);
        this.frameDiagnostics.drawCalls += 1;

        const left = originX + offsetX;
        const top = originY + offsetY;
        const right = left + safeWidth / safeZoom;
        const bottom = top + safeHeight / safeZoom;
        const fullscreenVertices = new Float32Array([
            left, top, 1,
            right, top, 1,
            right, bottom, 1,
            left, top, 1,
            right, bottom, 1,
            left, bottom, 1
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.caveMaskFullscreenBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, fullscreenVertices, gl.DYNAMIC_DRAW);
        gl.colorMask(true, true, true, true);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.stencilMask(0x00);
        gl.stencilFunc(gl.EQUAL, 0, 0x01);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        this.bindCaveMaskBuffer(this.caveMaskFullscreenBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.frameDiagnostics.drawCalls += 1;

        gl.stencilMask(0xff);
        gl.disable(gl.STENCIL_TEST);
        gl.colorMask(true, true, true, true);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.useProgram(this.program);
        gl.uniform2f(this.resolutionLocation, safeWidth, safeHeight);
        gl.uniform1i(this.textureLocation, 0);
        gl.activeTexture(gl.TEXTURE0);
        this.currentBlendMode = "alpha";
        this.currentTextureRecord = null;
        return true;
    }

    endFrame() {
        this.flush();
        this.frameDiagnostics.staticTextureCount = this.textureRecords.size;
        this.frameDiagnostics.residentTextureBytes = this.estimatedTextureBytes();
        this.frameDiagnostics.contextLost = Boolean(this.contextLost);
        return this.getDiagnostics();
    }

    getDiagnostics() {
        return {
            ...this.frameDiagnostics,
            contextRestores: this.totalDiagnostics.contextRestores,
            contextLosses: this.totalDiagnostics.contextLosses
        };
    }

    ensureCapacity(additionalQuads = 1) {
        const requiredFloats = this.vertexFloatCount + additionalQuads * VERTICES_PER_QUAD * FLOATS_PER_VERTEX;
        if (requiredFloats <= this.vertexData.length) return;
        this.flush();
        while (this.quadCapacity * VERTICES_PER_QUAD * FLOATS_PER_VERTEX < requiredFloats) {
            this.quadCapacity *= 2;
        }
        this.vertexData = new Float32Array(this.quadCapacity * VERTICES_PER_QUAD * FLOATS_PER_VERTEX);
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    textureRecord(source, dynamic = false, forceUpdate = false) {
        if (!source) return null;
        let record = this.textureCache.get(source);
        const dimensions = sourceDimensions(source);
        const maxTextureSize = this.getMaxTextureSize();
        this.lastTextureError = "";
        if (dimensions.width > maxTextureSize || dimensions.height > maxTextureSize) {
            this.lastTextureError = `WebGL2 texture source ${dimensions.width}x${dimensions.height} exceeds max texture size ${maxTextureSize}.`;
            console.warn(this.lastTextureError);
            return null;
        }
        if (!record) {
            const texture = this.gl.createTexture();
            if (!texture) {
                this.lastTextureError = "WebGL2 could not allocate a texture object.";
                return null;
            }
            record = {
                texture,
                source,
                width: dimensions.width,
                height: dimensions.height,
                dynamic: Boolean(dynamic),
                uploadedFrame: -1
            };
            this.textureCache.set(source, record);
            this.textureRecords.add(record);
            try {
                this.uploadTexture(record, true);
            } catch (error) {
                this.lastTextureError = error?.message || String(error || "WebGL2 texture upload failed.");
                this.textureCache.delete(source);
                this.textureRecords.delete(record);
                if (this.currentTextureRecord === record) this.currentTextureRecord = null;
                this.gl.deleteTexture(texture);
                return null;
            }
        } else if (dynamic && (forceUpdate || record.uploadedFrame !== this.frameId)) {
            const resized = record.width !== dimensions.width || record.height !== dimensions.height;
            const previousWidth = record.width;
            const previousHeight = record.height;
            record.width = dimensions.width;
            record.height = dimensions.height;
            record.dynamic = true;
            try {
                this.uploadTexture(record, resized);
            } catch (error) {
                this.lastTextureError = error?.message || String(error || "WebGL2 texture update failed.");
                record.width = previousWidth;
                record.height = previousHeight;
                return null;
            }
        }
        return record;
    }

    uploadTexture(record, allocate) {
        const gl = this.gl;
        this.flush();
        gl.bindTexture(gl.TEXTURE_2D, record.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        if (gl.UNPACK_COLORSPACE_CONVERSION_WEBGL !== undefined) {
            gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
        }
        try {
            if (allocate) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, record.source);
                this.frameDiagnostics.textureUploads += 1;
            } else {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, record.source);
                this.frameDiagnostics.textureUpdates += 1;
            }
            const errorCode = typeof gl.getError === "function" ? gl.getError() : gl.NO_ERROR;
            if (errorCode && errorCode !== gl.NO_ERROR) {
                throw new Error(`WebGL2 texture ${allocate ? "allocation" : "update"} failed: ${webglErrorName(gl, errorCode)} for ${record.width}x${record.height}.`);
            }
            record.uploadedFrame = this.frameId;
        } finally {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            if (gl.UNPACK_COLORSPACE_CONVERSION_WEBGL !== undefined) {
                gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    switchTexture(record) {
        if (this.currentTextureRecord === record) return;
        this.flush();
        this.currentTextureRecord = record;
    }

    normalizeBlendMode(mode) {
        if (mode === "additive") return "additive";
        if (mode === "brightenOnly") return "brightenOnly";
        return "alpha";
    }

    applyBlendMode(mode, force = false) {
        const normalized = this.normalizeBlendMode(mode);
        if (!force && this.currentBlendMode === normalized) return;
        this.flush();
        this.currentBlendMode = normalized;
        const gl = this.gl;
        if (normalized === "additive") {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
        } else if (normalized === "brightenOnly") {
            // Fixed-function GPU maximum blending: source pixels can raise a
            // destination channel, but can never make that channel darker.
            gl.blendEquationSeparate(gl.MAX, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        } else {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
    }

    queueSprite({
        source,
        sourceX = 0,
        sourceY = 0,
        sourceWidth = null,
        sourceHeight = null,
        centerX = 0,
        centerY = 0,
        width = 1,
        height = 1,
        rotation = 0,
        mirrorX = false,
        mirrorY = false,
        alpha = 1,
        tint = [1, 1, 1, 1],
        dynamic = false,
        forceDynamicUpload = false,
        blendMode = "alpha"
    }) {
        if (!this.available || this.contextLost || !source) return false;
        const record = source === this.whiteTextureRecord
            ? this.whiteTextureRecord
            : this.textureRecord(source, dynamic, forceDynamicUpload);
        if (!record) return false;
        this.applyBlendMode(blendMode);
        this.switchTexture(record);
        this.ensureCapacity(1);

        const safeWidth = finiteNumber(width, 0);
        const safeHeight = finiteNumber(height, 0);
        if (Math.abs(safeWidth) < 0.0001 || Math.abs(safeHeight) < 0.0001) return false;
        const halfWidth = safeWidth * 0.5;
        const halfHeight = safeHeight * 0.5;
        const angle = finiteNumber(rotation, 0);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const transform = (x, y) => ({
            x: finiteNumber(centerX, 0) + x * cos - y * sin,
            y: finiteNumber(centerY, 0) + x * sin + y * cos
        });
        const topLeft = transform(-halfWidth, -halfHeight);
        const topRight = transform(halfWidth, -halfHeight);
        const bottomRight = transform(halfWidth, halfHeight);
        const bottomLeft = transform(-halfWidth, halfHeight);

        const sw = Math.max(0.0001, sourceWidth == null ? record.width : finiteNumber(sourceWidth, record.width));
        const sh = Math.max(0.0001, sourceHeight == null ? record.height : finiteNumber(sourceHeight, record.height));
        let u0 = finiteNumber(sourceX, 0) / record.width;
        let u1 = (finiteNumber(sourceX, 0) + sw) / record.width;
        let vTop = 1 - finiteNumber(sourceY, 0) / record.height;
        let vBottom = 1 - (finiteNumber(sourceY, 0) + sh) / record.height;
        if (mirrorX) [u0, u1] = [u1, u0];
        if (mirrorY) [vTop, vBottom] = [vBottom, vTop];
        const baseTint = Array.isArray(tint) ? tint : parseCssColor(tint);
        const color = [
            clamp01(baseTint[0] ?? 1),
            clamp01(baseTint[1] ?? 1),
            clamp01(baseTint[2] ?? 1),
            clamp01((baseTint[3] ?? 1) * finiteNumber(alpha, 1))
        ];

        let offset = this.vertexFloatCount;
        appendVertex(this.vertexData, offset, topLeft.x, topLeft.y, u0, vTop, color); offset += FLOATS_PER_VERTEX;
        appendVertex(this.vertexData, offset, topRight.x, topRight.y, u1, vTop, color); offset += FLOATS_PER_VERTEX;
        appendVertex(this.vertexData, offset, bottomRight.x, bottomRight.y, u1, vBottom, color); offset += FLOATS_PER_VERTEX;
        appendVertex(this.vertexData, offset, topLeft.x, topLeft.y, u0, vTop, color); offset += FLOATS_PER_VERTEX;
        appendVertex(this.vertexData, offset, bottomRight.x, bottomRight.y, u1, vBottom, color); offset += FLOATS_PER_VERTEX;
        appendVertex(this.vertexData, offset, bottomLeft.x, bottomLeft.y, u0, vBottom, color); offset += FLOATS_PER_VERTEX;
        this.vertexFloatCount = offset;
        this.frameDiagnostics.quads += 1;
        return true;
    }

    queueSurface(source, x, y, width, height, alpha = 1, dynamic = false) {
        const dimensions = sourceDimensions(source);
        if (dynamic) this.frameDiagnostics.canvasLayerUploads += 1;
        return this.queueSprite({
            source,
            sourceX: 0,
            sourceY: 0,
            sourceWidth: dimensions.width,
            sourceHeight: dimensions.height,
            centerX: finiteNumber(x, 0) + finiteNumber(width, 0) * 0.5,
            centerY: finiteNumber(y, 0) + finiteNumber(height, 0) * 0.5,
            width,
            height,
            alpha,
            dynamic,
            forceDynamicUpload: dynamic
        });
    }

    queueSolidRect(x, y, width, height, color = "#ffffff") {
        return this.queueSprite({
            source: this.whiteTextureRecord,
            sourceX: 0,
            sourceY: 0,
            sourceWidth: 1,
            sourceHeight: 1,
            centerX: finiteNumber(x, 0) + finiteNumber(width, 0) * 0.5,
            centerY: finiteNumber(y, 0) + finiteNumber(height, 0) * 0.5,
            width,
            height,
            tint: parseCssColor(color),
            alpha: 1,
            dynamic: false
        });
    }

    flush() {
        if (!this.available || this.contextLost || this.vertexFloatCount <= 0 || !this.currentTextureRecord) {
            this.vertexFloatCount = 0;
            return;
        }
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexData.subarray(0, this.vertexFloatCount));
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.currentTextureRecord.texture);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexFloatCount / FLOATS_PER_VERTEX);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.frameDiagnostics.drawCalls += 1;
        this.vertexFloatCount = 0;
    }
}

export function createWebGL2RendererBackend(canvas) {
    if (!canvas?.getContext) return null;
    let gl = null;
    try {
        gl = canvas.getContext("webgl2", {
            alpha: false,
            antialias: true,
            depth: false,
            stencil: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance",
            // Android Chromium can present discarded/partially rendered buffers
            // as black flashes when low-latency desynchronization is requested.
            desynchronized: false
        });
    } catch {
        return null;
    }
    if (!gl) return null;
    try {
        return new WebGL2RendererBackend(canvas, gl);
    } catch (error) {
        console.warn("WebGL2 renderer initialization failed; falling back to Canvas 2D.", error);
        return null;
    }
}
