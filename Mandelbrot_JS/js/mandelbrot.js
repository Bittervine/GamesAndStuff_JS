var canvas1=document.getElementById("myCanvas");
var ctx=canvas1.getContext("2d")    
var Width = 100;
var Height = 100;    
var imageData = ctx.createImageData(Width, Height);
var MouseDownPos=[]; 
var dn_state = false;

/***********************************/
/*** BITTERLIB UTILITY FUNCTIONS ***/
/***********************************/

stdout = ""
function print(s)
{
    console.log(s)
    stdout=stdout+s+"<br>";
    try
    {
        window.stdout1.innerHTML = stdout;
    }
    catch(e)
    {
        // No stdout element to print to
    }
}

/* Recursively print object */

function inspect(o,path,maxdepth)
{
    debugger;
    if(typeof(maxdepth)==='undefined')
    {    
        maxdepth=2
    }
    if(typeof(path)==='undefined')
    {    
        path="ROOT"
    }
    
    for(key in o)
    {            
        try
        {        
            print(path+"."+o.nodeName+"."+key+" = "+o[key].toString()+"\n")
            if(maxdepth>=1)
            {
                maxdepth --;
                inspect(o[key],path+"."+o.nodeName+"."+key,maxdepth);
            }
        }
        catch(e)
        {
            print(path+"."+o.nodeName+"."+key+" = ?\n");
        }
    }
}

/* Convert touch events to mouse events */

function mapTouchToMouse(element)
{    
    function initTouchEvent(element, event_name)
    {
        if("on"+event_name in document.documentElement)
        {
            element.addEventListener(event_name, touchHandler, true);
        }
    }

    function touchHandler(event)
    {
        var touches = event.changedTouches, first = touches[0], type = "";
        switch(event.type)
        {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type = "mousemove"; break;        
            case "touchend":   type = "mouseup"; break;
            default: return;
        }
        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);
        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    }
    
    function initTouchEvent(element, event_name)
    {
        if("on"+event_name in document.documentElement)
        {
            element.addEventListener(event_name, touchHandler, true);
        }
    }

    if(typeof(element)==='undefined')
    {   
        element=window;
    }

    initTouchEvent(element,"touchstart")
    initTouchEvent(element,"touchmove")        
    initTouchEvent(element,"touchend")
    initTouchEvent(element,"touchcancel") 
}

/* Mouse utils */

function getMousePos(canvas, evt) 
{
    var rect = canvas.getBoundingClientRect(), root = document.documentElement;
    var mouseX = evt.clientX - rect.top - root.scrollTop;
    var mouseY = evt.clientY - rect.left - root.scrollLeft;
    return {
      x: mouseX,
      y: mouseY
    };
}


/* Misc */

function setPixel(imageData, x, y, r, g, b, a) 
{
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

/***********************************/
/***       CALCULATION           ***/
/***********************************/

ZoomR1 = -2.0;
ZoomR2 = 2.0;
ZoomI1 = -2.0;
ZoomI2 = 2.0;
MaxN = 500;
DivergeLimit2 = 2.0*2.0

CurrentX = 0;
CurrentY = 0;

function drawFractal()
{           
    var start = Date.now();
    var iterations = 0;
    
    if(dn_state)
    {
        /* Dont draw while zooming with mouse */
        return;
    }
    
    while(Date.now() - start < 100)  /* Dont freeze for more than 100 ms */
    {
        if(CurrentY>=Height)
        {
            /* Nothing more to draw */
            break;                
        }
        if(CurrentX>=Width)
        {
            CurrentX = 0;
            CurrentY ++;
            
        }
        
        /* Actually calc mandelbrot set */
        
        CR=ZoomR1+(ZoomR2-ZoomR1)*CurrentX/(Width); 
        CI=ZoomI1+(ZoomI2-ZoomI1)*CurrentY/(Height); 
        R = 0;
        I = 0;
        
        for(iterations=0;iterations<MaxN;iterations++)
        {
            newR = R*R-I*I+CR
            newI = 2*R*I+CI;
            
            R=newR;
            I=newI;
            
            if(R*R+I*I > DivergeLimit2)
            {
                break;
            }
        }
        
        /* Put pixels! */
        setPixel(imageData,CurrentX,CurrentY,255-255*iterations/MaxN,255-255*iterations/MaxN,255-255*iterations/MaxN,255);
        CurrentX ++;
    }                
    
    ctx.putImageData(imageData, 0, 0); 
    return;
}



/***********************************/
/***       CALLBACKS ETC         ***/
/***********************************/

function myTimer()
{
    drawFractal()
}

function onCanvas1MouseMove(event)
{
    
                            
    if(dn_state)
    {
        pos = getMousePos(canvas1,event);
        
        /*setPixel(imageData,pos.x,pos.y,0,255,0,255);*/
        ctx.putImageData(imageData, 0, 0);  
        
        
                  
        up_x = pos.x;
        up_y = pos.y;
                        
              
                                  
        if(pos.y > dn_y)
        {    
            ctx.strokeStyle = '#ff0000'; // red indicate a zoom IN
        }
        else
        {    
            ctx.strokeStyle = '#0000ff'; // blue indicate a zoom OUT
        }            
        ctx.strokeRect(dn_x, dn_y, pos.x-dn_x, pos.y-dn_y);
    }
}

function onCanvas1MouseCancel(event)
{
    dn_state = false;
}

function onCanvas1MouseDn(event)
{
    if(dn_state)
    {
        print("REDUNDANT DN");
        return;
    }
    pos = getMousePos(canvas1,event);
    dn_state = true;
    dn_x = pos.x;
    dn_y = pos.y    
}

function onCanvas1MouseUp(event)
{
    if(!dn_state)
    {
        print("REDUNDANT UP");
        return;
    }

    dn_state = false;
    pos = getMousePos(canvas1,event);
    up_x = pos.x;
    up_y = pos.y;
    
    if(up_x < dn_x)
    {
        tmp = up_x;
        up_x = dn_x;
        dn_x = tmp;
    }

    /* Zoom in or out? */
    print("Old: "+ZoomR1+" "+ZoomR2+" "+ZoomI1+" "+ZoomI2);


    if(Math.abs(up_x-dn_x)<50 && Math.abs(up_y-dn_y)<50)
    {
        console.log("Zoom")
        /* "Probably a double click. Lets just zoom in a little" */
        CenterR = ZoomR1+(ZoomR2-ZoomR1)*dn_x/(Width);            
        DeltaR = (ZoomR2-ZoomR1)/2;            
        ZoomR1prim = CenterR-0.3*DeltaR
        ZoomR2prim = CenterR+0.3*DeltaR

        CenterI = ZoomI1+(ZoomI2-ZoomI1)*dn_y/(Height);            
        DeltaI = (ZoomI2-ZoomI1)/2;            
        ZoomI1prim = CenterI-0.3*DeltaI
        ZoomI2prim = CenterI+0.3*DeltaI

    }
    else if(up_y > dn_y)
    {
        /* Zoom in */
        print("ZoomIn: "+dn_x+" "+up_x+" "+dn_y+" "+up_y);

        ZoomR1prim=ZoomR1+(ZoomR2-ZoomR1)*dn_x/(Width);
        ZoomR2prim=ZoomR1+(ZoomR2-ZoomR1)*up_x/(Width);
        ZoomI1prim=ZoomI1+(ZoomI2-ZoomI1)*dn_y/(Height); 
        ZoomI2prim=ZoomI1+(ZoomI2-ZoomI1)*up_y/(Height);             
    }
    else
    {
        tmp = up_y;
        up_y = dn_y;
        dn_y = tmp;
    
        /* Zoom out */
        print("ZoomOut: "+dn_x+" "+up_x+" "+dn_y+" "+up_y);


        //~ ZoomR1=ZoomR1prim+(ZoomR2prim-ZoomR1prim)*dn_x/(Width);
        //~ ZoomR2=ZoomR1prim+(ZoomR2prim-ZoomR1prim)*up_x/(Width);
        //~ ZoomI1=ZoomI1prim+(ZoomI2prim-ZoomI1prim)*dn_y/(Height); 
        //~ ZoomI2=ZoomI1prim+(ZoomI2prim-ZoomI1prim)*up_y/(Height);             
        //~ (Solve this linear system...)

        fracR1 = dn_x/Width;
        fracR2 = up_x/Width;                   
        fracI1 = dn_y/Height;
        fracI2 = up_y/Height;

        ZoomR1prim = (ZoomR1*fracR2-ZoomR2*fracR1)/(fracR2-fracR1);
        ZoomR2prim = (ZoomR1*fracR2-ZoomR2*fracR1+ZoomR2-ZoomR1)/(fracR2-fracR1);
        ZoomI1prim = (ZoomI1*fracI2-ZoomI2*fracI1)/(fracI2-fracI1);
        ZoomI2prim = (ZoomI1*fracI2-ZoomI2*fracI1+ZoomI2-ZoomI1)/(fracI2-fracI1);                        
        
    }
        
    ZoomI1 = ZoomI1prim;
    ZoomI2 = ZoomI2prim;
    ZoomR1 = ZoomR1prim;
    ZoomR2 = ZoomR2prim;


    print("New: "+ZoomR1+" "+ZoomR2+" "+ZoomI1+" "+ZoomI2)                
            
    /* Force redraw */
    CurrentX = 0;
    CurrentY = 0;
        
}

function onResize()
{
    Width = (window.innerWidth-0);
    Height = (window.innerHeight-0);                     
    canvas1.width = Width;
    canvas1.height = Height;
    CurrentX = 0;
    CurrentY = 0;
    imageData = ctx.createImageData(Width, Height);        
}


function init() 
{                   
    // Covert 'touch' event into 'mouse' event (for phones and pads)
    mapTouchToMouse(canvas1);
    
    canvas1.onmousedown = onCanvas1MouseDn;
    canvas1.onmouseup = onCanvas1MouseUp;
    canvas1.onmousemove = onCanvas1MouseMove;
    canvas1.onmousecancel = onCanvas1MouseCancel;
    window.onresize = onResize;

    onResize();
}

setInterval(myTimer,100);

// Let page load and then actually do init once document layout is complete...
window.onload = () =>
{
    setTimeout(init,100); 
}

  
