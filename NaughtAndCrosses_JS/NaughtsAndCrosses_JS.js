'use strict';

function createEngine(opts) {
    var ROWS = (opts && opts.rows) ? (opts.rows | 0) : ((opts && opts.size) ? (opts.size | 0) : 20);
    var COLS = (opts && opts.cols) ? (opts.cols | 0) : ((opts && opts.size) ? (opts.size | 0) : 20);
    var EMPTY = 0;
    var O = 1;
    var X = 2;
    var NEED = 5;
    var INF = 2147483647;
    var WIN_SCORE = 10000000;
    var TT_EXACT = 0;
    var TT_LOWER = 1;
    var TT_UPPER = -1;

    var board = createBoard();
    var influence = createInfluence();
    var history = [];
    var lastMove = null;
    var stoneCount = 0;
    var tt = {};
    var boardHash = 0;
    var zobrist = initZobrist();

    var searchDeadline = 0;
    var searchAbort = false;
    var searchNodeCount = 0;
    var searchRootPly = 0;
    var searchRootClumsyPct = 0;
    var searchRootIgnoreMap = null;

    function createBoard() {
        var b = [];
        var r;
        var c;
        for (r = 0; r < ROWS; r++) {
            b[r] = [];
            for (c = 0; c < COLS; c++) b[r][c] = EMPTY;
        }
        return b;
    }

    function createInfluence() {
        var inf = [];
        var r;
        var c;
        for (r = 0; r < ROWS; r++) {
            inf[r] = [];
            for (c = 0; c < COLS; c++) inf[r][c] = 0;
        }
        return inf;
    }

    function initZobrist() {
        var z = [[], [], []];
        var seed = 2463534242;
        var i;
        function rand32() {
            seed = (seed ^ (seed << 13)) >>> 0;
            seed = (seed ^ (seed >>> 17)) >>> 0;
            seed = (seed ^ (seed << 5)) >>> 0;
            return seed >>> 0;
        }
        for (i = 0; i < ROWS * COLS; i++) {
            z[O][i] = rand32();
            z[X][i] = rand32();
        }
        return z;
    }

    function inBounds(r, c) {
        return r >= 0 && r < ROWS && c >= 0 && c < COLS;
    }

    function hasFiveFrom(r, c, player) {
        var dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        var i;
        for (i = 0; i < dirs.length; i++) {
            var dr = dirs[i][0];
            var dc = dirs[i][1];
            var count = 1;
            var rr = r + dr;
            var cc = c + dc;
            while (inBounds(rr, cc) && board[rr][cc] === player) {
                count++;
                rr += dr;
                cc += dc;
            }
            rr = r - dr;
            cc = c - dc;
            while (inBounds(rr, cc) && board[rr][cc] === player) {
                count++;
                rr -= dr;
                cc -= dc;
            }
            if (count >= NEED) return true;
        }
        return false;
    }

    function isBoardFull() {
        return stoneCount >= ROWS * COLS;
    }

    function adjustInfluence(r, c, delta) {
        var rr;
        var cc;
        for (rr = r - 2; rr <= r + 2; rr++) {
            for (cc = c - 2; cc <= c + 2; cc++) {
                if (!inBounds(rr, cc)) continue;
                if (rr === r && cc === c) continue;
                influence[rr][cc] += delta;
            }
        }
    }

    function applyMove(r, c, player) {
        board[r][c] = player;
        history.push([r, c, player]);
        lastMove = [r, c, player];
        stoneCount++;
        boardHash = (boardHash ^ zobrist[player][r * COLS + c]) >>> 0;
        adjustInfluence(r, c, 1);
    }

    function undoMove() {
        var m = history.pop();
        if (!m) return null;
        board[m[0]][m[1]] = EMPTY;
        lastMove = history.length ? history[history.length - 1] : null;
        stoneCount--;
        boardHash = (boardHash ^ zobrist[m[2]][m[0] * COLS + m[1]]) >>> 0;
        adjustInfluence(m[0], m[1], -1);
        return m;
    }

    function scoreWindow(xCount, oCount, openEnds) {
        if (xCount > 0 && oCount > 0) return 0;
        if (xCount === 0 && oCount === 0) return 0;
        if (xCount >= NEED) return WIN_SCORE;
        if (oCount >= NEED) return -WIN_SCORE;
        if (xCount > 0) {
            if (xCount === 4) return openEnds === 2 ? 300000 : 50000;
            if (xCount === 3) return openEnds === 2 ? 15000 : 2000;
            if (xCount === 2) return openEnds === 2 ? 900 : 120;
            if (xCount === 1) return openEnds === 2 ? 40 : 5;
        }
        if (oCount > 0) {
            if (oCount === 4) return openEnds === 2 ? -320000 : -52000;
            if (oCount === 3) return openEnds === 2 ? -17000 : -2500;
            if (oCount === 2) return openEnds === 2 ? -1000 : -140;
            if (oCount === 1) return openEnds === 2 ? -45 : -6;
        }
        return 0;
    }

    function evaluateBoard() {
        var dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        var score = 0;
        var r;
        var c;
        var i;
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                if (board[r][c] === EMPTY) continue;
                for (i = 0; i < dirs.length; i++) {
                    var dr = dirs[i][0];
                    var dc = dirs[i][1];
                    var pr = r - dr;
                    var pc = c - dc;
                    if (inBounds(pr, pc) && board[pr][pc] === board[r][c]) continue;

                    var xCount = 0;
                    var oCount = 0;
                    var len = 0;
                    var rr = r;
                    var cc = c;
                    while (inBounds(rr, cc) && board[rr][cc] !== EMPTY) {
                        if (board[rr][cc] === X) xCount++;
                        else oCount++;
                        len++;
                        rr += dr;
                        cc += dc;
                    }

                    var openEnds = 0;
                    if (inBounds(pr, pc) && board[pr][pc] === EMPTY) openEnds++;
                    if (inBounds(rr, cc) && board[rr][cc] === EMPTY) openEnds++;

                    if (len >= NEED) {
                        if (xCount >= NEED) return WIN_SCORE;
                        if (oCount >= NEED) return -WIN_SCORE;
                    }
                    score += scoreWindow(xCount, oCount, openEnds);
                }
            }
        }
        return score;
    }

    function isWinningMove(r, c, player) {
        board[r][c] = player;
        var win = hasFiveFrom(r, c, player);
        board[r][c] = EMPTY;
        return win;
    }

    function threatLevelIfPlace(r, c, player) {
        var dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        var i;
        var hasWin = false;
        var numOpenFours = 0;
        var numSimpleFours = 0;
        var numOpenThrees = 0;
        var hasSplitTwoTwo = false;
        // Simulate placing one stone and count line patterns by direction.
        // This function only evaluates single-line patterns. Multi-line
        // composites (for example double-open-three) are handled elsewhere.
        board[r][c] = player;
        for (i = 0; i < dirs.length; i++) {
            var dr = dirs[i][0];
            var dc = dirs[i][1];
            var count = 1;
            var rr = r + dr;
            var cc = c + dc;
            while (inBounds(rr, cc) && board[rr][cc] === player) {
                count++;
                rr += dr;
                cc += dc;
            }
            var openEnds = 0;
            if (inBounds(rr, cc) && board[rr][cc] === EMPTY) openEnds++;
            rr = r - dr;
            cc = c - dc;
            while (inBounds(rr, cc) && board[rr][cc] === player) {
                count++;
                rr -= dr;
                cc -= dc;
            }
            if (inBounds(rr, cc) && board[rr][cc] === EMPTY) openEnds++;

            if (count >= NEED) {
                hasWin = true;
                break;
            }
            if (count >= 4 && openEnds >= 1) {
                if (openEnds >= 2) numOpenFours++;
                else numSimpleFours++;
            } else if (count >= 3 && openEnds === 2) {
                numOpenThrees++;
            }

            // Detect XX-XX along this direction, where the simulated move is part
            // of the four stones. This is treated as a level-1 forcing threat.
            var line = [];
            var k;
            for (k = -4; k <= 4; k++) {
                rr = r + dr * k;
                cc = c + dc * k;
                line.push(inBounds(rr, cc) ? board[rr][cc] : -1);
            }
            // Segment start s maps to offsets [s..s+4] in [-4..4] space.
            // Center (offset 0) is at line index 4.
            var s;
            for (s = 0; s <= 4; s++) {
                if (!(s <= 4 && 4 <= s + 4)) continue;
                if (line[s] === player &&
                    line[s + 1] === player &&
                    line[s + 2] === EMPTY &&
                    line[s + 3] === player &&
                    line[s + 4] === player &&
                    line[4] === player) {
                    hasSplitTwoTwo = true;
                    break;
                }
            }
            if (hasSplitTwoTwo) {
                // Keep scanning other dirs for higher-priority patterns.
            }
        }
        board[r][c] = EMPTY;
        if (hasWin) return 3;
        // A double-open-three is typically a forcing threat (near open-four strength).
        if (numOpenFours > 0 || numSimpleFours > 0 || numOpenThrees >= 2) return 2;
        if (numOpenThrees > 0 || hasSplitTwoTwo) return 1;
        return 0;
    }

    function threatFeaturesIfPlace(r, c, player) {
        var dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        var i;
        var out = {
            win: false,
            openFour: false,
            simpleFour: false,
            openThreeCount: 0,
            doubleOpenThree: false,
            splitTwoTwoCount: 0,
            hasSplitTwoTwo: false
        };
        board[r][c] = player;
        for (i = 0; i < dirs.length; i++) {
            var dr = dirs[i][0];
            var dc = dirs[i][1];
            var count = 1;
            var rr = r + dr;
            var cc = c + dc;
            while (inBounds(rr, cc) && board[rr][cc] === player) {
                count++;
                rr += dr;
                cc += dc;
            }
            var openEnds = 0;
            if (inBounds(rr, cc) && board[rr][cc] === EMPTY) openEnds++;
            rr = r - dr;
            cc = c - dc;
            while (inBounds(rr, cc) && board[rr][cc] === player) {
                count++;
                rr -= dr;
                cc -= dc;
            }
            if (inBounds(rr, cc) && board[rr][cc] === EMPTY) openEnds++;

            if (count >= NEED) out.win = true;
            if (count >= 4 && openEnds >= 2) out.openFour = true;
            else if (count >= 4 && openEnds >= 1) out.simpleFour = true;
            if (count >= 3 && openEnds === 2) out.openThreeCount++;

            // Detect XX-XX on this direction around the simulated move.
            var line = [];
            var k;
            for (k = -4; k <= 4; k++) {
                rr = r + dr * k;
                cc = c + dc * k;
                line.push(inBounds(rr, cc) ? board[rr][cc] : -1);
            }
            var s;
            for (s = 0; s <= 4; s++) {
                if (line[s] === player &&
                    line[s + 1] === player &&
                    line[s + 2] === EMPTY &&
                    line[s + 3] === player &&
                    line[s + 4] === player &&
                    line[4] === player) {
                    out.splitTwoTwoCount++;
                    break;
                }
            }
        }
        board[r][c] = EMPTY;
        out.doubleOpenThree = out.openThreeCount >= 2;
        out.hasSplitTwoTwo = out.splitTwoTwoCount > 0;
        return out;
    }

    function localShapeScore(r, c, player) {
        var opp = player === X ? O : X;
        var friendly = 0;
        var enemy = 0;
        var rr;
        var cc;
        for (rr = r - 1; rr <= r + 1; rr++) {
            for (cc = c - 1; cc <= c + 1; cc++) {
                if (!inBounds(rr, cc) || (rr === r && cc === c)) continue;
                if (board[rr][cc] === player) friendly++;
                else if (board[rr][cc] === opp) enemy++;
            }
        }
        return friendly * 12 + enemy * 7;
    }

    function normalizeRootClumsy(clumsy) {
        var n = parseInt(clumsy, 10);
        if (!isFinite(n) || n < 0) return 0;
        if (n > 99) return 99;
        return n;
    }

    function collectRootCandidatesForClumsy() {
        var out = [];
        var r;
        var c;
        if (!stoneCount) return out;
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                if (board[r][c] !== EMPTY) continue;
                if (influence[r][c] <= 0) continue;
                out.push([r, c]);
            }
        }
        if (!out.length) {
            for (r = 0; r < ROWS; r++) {
                for (c = 0; c < COLS; c++) {
                    if (board[r][c] === EMPTY) out.push([r, c]);
                }
            }
        }
        return out;
    }

    function configureRootClumsy(clumsy) {
        var i;
        var key;
        var candidates;
        var keptCount = 0;
        searchRootClumsyPct = normalizeRootClumsy(clumsy);
        searchRootIgnoreMap = {};
        if (searchRootClumsyPct <= 0) return;
        candidates = collectRootCandidatesForClumsy();
        if (!candidates.length) return;
        for (i = 0; i < candidates.length; i++) {
            if (Math.random() < (searchRootClumsyPct / 100)) {
                key = candidates[i][0] * COLS + candidates[i][1];
                searchRootIgnoreMap[key] = true;
            } else {
                keptCount++;
            }
        }
        if (keptCount <= 0) {
            key = candidates[0][0] * COLS + candidates[0][1];
            delete searchRootIgnoreMap[key];
        }
    }

    function prioritizeTTMove(moves, ttMove) {
        if (!ttMove) return;
        var i;
        for (i = 0; i < moves.length; i++) {
            if (moves[i][0] === ttMove[0] && moves[i][1] === ttMove[1]) {
                if (i > 0) {
                    var t = moves[0];
                    moves[0] = moves[i];
                    moves[i] = t;
                }
                return;
            }
        }
    }

    function generateCandidatesInternal(player, depthLeft, ttMove, applyLimit) {
        var moves = [];
        var mustMap = {};
        var threatClass = {};
        var centerR = Math.floor(ROWS / 2);
        var centerC = Math.floor(COLS / 2);
        var opp = player === X ? O : X;
        var r;
        var c;
        var limit;
        var isRoot = history.length === searchRootPly;
        if (!stoneCount) {
            moves.push([centerR, centerC]);
            return moves;
        }
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                if (board[r][c] !== EMPTY) continue;
                if (influence[r][c] <= 0) continue;
                var priority = localShapeScore(r, c, player) + influence[r][c] * 3;
                var selfWin = isWinningMove(r, c, player);
                var oppWin = false;
                var selfThreat;
                var oppThreat;
                var selfFeat;
                var oppFeat;
                var key = r * COLS + c;
                if (selfWin) priority += 100000000;
                else {
                    oppWin = isWinningMove(r, c, opp);
                    if (oppWin) priority += 90000000;
                }

                selfThreat = threatLevelIfPlace(r, c, player);
                oppThreat = threatLevelIfPlace(r, c, opp);
                if (selfThreat >= 2) priority += 3000000;
                else if (selfThreat === 1) priority += 300000;
                if (oppThreat >= 2) priority += 3500000;
                else if (oppThreat === 1) priority += 450000;

                if (selfWin || oppWin || selfThreat >= 1 || oppThreat >= 1) {
                    mustMap[key] = true;
                }

                if (isRoot && player === X) {
                    selfFeat = threatFeaturesIfPlace(r, c, player);
                    oppFeat = threatFeaturesIfPlace(r, c, opp);
                    if (selfWin || selfFeat.win) threatClass[key] = 0;
                    else if (oppWin || oppFeat.win) threatClass[key] = 1;
                    else if (selfFeat.openFour || selfFeat.simpleFour) threatClass[key] = 2;
                    else if (oppFeat.openFour || oppFeat.simpleFour) threatClass[key] = 3;
                    else if (selfFeat.doubleOpenThree) threatClass[key] = 4;
                    else if (oppFeat.doubleOpenThree || oppFeat.openThreeCount >= 1 || oppFeat.hasSplitTwoTwo) threatClass[key] = 5;
                }
                priority -= Math.abs(r - centerR) + Math.abs(c - centerC);
                moves.push([r, c, priority]);
            }
        }
        if (isRoot && player === X && searchRootClumsyPct > 0) {
            var clumsyFiltered = [];
            var j;
            for (j = 0; j < moves.length; j++) {
                var clumsyKey = moves[j][0] * COLS + moves[j][1];
                if (searchRootIgnoreMap && searchRootIgnoreMap[clumsyKey]) continue;
                clumsyFiltered.push(moves[j]);
            }
            if (clumsyFiltered.length) moves = clumsyFiltered;
        }
        moves.sort(function (a, b) { return b[2] - a[2]; });
        prioritizeTTMove(moves, ttMove);
        if (applyLimit) {
            if (depthLeft >= 4) limit = 14;
            else if (depthLeft === 3) limit = 18;
            else limit = 24;
            if (moves.length > limit) {
                var kept = [];
                var seen = {};
                var i;
                var key;
                var forcedClass = -1;
                if (isRoot && player === X) {
                    for (i = 0; i < moves.length; i++) {
                        key = moves[i][0] * COLS + moves[i][1];
                        if (!threatClass.hasOwnProperty(key)) continue;
                        if (forcedClass < 0 || threatClass[key] < forcedClass) forcedClass = threatClass[key];
                    }
                    if (forcedClass >= 0) {
                        for (i = 0; i < moves.length && kept.length < limit; i++) {
                            key = moves[i][0] * COLS + moves[i][1];
                            if (!threatClass.hasOwnProperty(key) || threatClass[key] !== forcedClass) continue;
                            kept.push(moves[i]);
                            seen[key] = true;
                        }
                    }
                }
                for (i = 0; i < moves.length; i++) {
                    if (kept.length >= limit) break;
                    key = moves[i][0] * COLS + moves[i][1];
                    if (!mustMap[key]) continue;
                    if (seen[key]) continue;
                    kept.push(moves[i]);
                    seen[key] = true;
                }
                for (i = 0; i < moves.length && kept.length < limit; i++) {
                    key = moves[i][0] * COLS + moves[i][1];
                    if (seen[key]) continue;
                    kept.push(moves[i]);
                    seen[key] = true;
                }
                moves = kept;
            }
        }
        return moves;
    }

    function generateCandidates(player, depthLeft, ttMove) {
        return generateCandidatesInternal(player, depthLeft, ttMove, true);
    }

    function generateCandidatesRaw(player, depthLeft, ttMove) {
        return generateCandidatesInternal(player, depthLeft, ttMove, false);
    }

    function terminalFromLast() {
        if (!lastMove) return 0;
        if (hasFiveFrom(lastMove[0], lastMove[1], lastMove[2])) return lastMove[2] === X ? 1 : -1;
        if (isBoardFull()) return 2;
        return 0;
    }

    function minimax(depth, alpha, beta, maximizing) {
        if ((searchNodeCount & 511) === 0) {
            if (Date.now() >= searchDeadline) searchAbort = true;
        }
        searchNodeCount++;
        if (searchAbort) return evaluateBoard();

        var t = terminalFromLast();
        if (t === 1) return WIN_SCORE + depth;
        if (t === -1) return -WIN_SCORE - depth;
        if (t === 2) return 0;
        if (depth <= 0) return evaluateBoard();

        var alphaOrig = alpha;
        var betaOrig = beta;
        var key = boardHash + '|' + depth + '|' + (maximizing ? 1 : 0);
        var entry = tt[key];
        if (entry && entry.depth >= depth) {
            if (entry.flag === TT_EXACT) return entry.score;
            if (entry.flag === TT_LOWER && entry.score > alpha) alpha = entry.score;
            else if (entry.flag === TT_UPPER && entry.score < beta) beta = entry.score;
            if (alpha >= beta) return entry.score;
        }

        var moves = generateCandidates(maximizing ? X : O, depth, entry ? entry.bestMove : null);
        if (!moves.length) {
            var noMoveScore = evaluateBoard();
            tt[key] = { depth: depth, score: noMoveScore, flag: TT_EXACT, bestMove: null };
            return noMoveScore;
        }

        var i;
        var move;
        var val;
        var bestMove = null;
        if (maximizing) {
            var best = -INF;
            for (i = 0; i < moves.length; i++) {
                move = moves[i];
                applyMove(move[0], move[1], X);
                val = minimax(depth - 1, alpha, beta, false);
                undoMove();
                if (searchAbort) break;
                if (val > best || !bestMove) {
                    best = val;
                    bestMove = [move[0], move[1]];
                }
                if (best > alpha) alpha = best;
                if (beta <= alpha) break;
            }
            if (searchAbort) return evaluateBoard();
            if (!bestMove && moves.length) bestMove = [moves[0][0], moves[0][1]];
            var maxFlag = TT_EXACT;
            if (best <= alphaOrig) maxFlag = TT_UPPER;
            else if (best >= betaOrig) maxFlag = TT_LOWER;
            tt[key] = { depth: depth, score: best, flag: maxFlag, bestMove: bestMove };
            return best;
        }

        var bestMin = INF;
        for (i = 0; i < moves.length; i++) {
            move = moves[i];
            applyMove(move[0], move[1], O);
            val = minimax(depth - 1, alpha, beta, true);
            undoMove();
            if (searchAbort) break;
            if (val < bestMin || !bestMove) {
                bestMin = val;
                bestMove = [move[0], move[1]];
            }
            if (bestMin < beta) beta = bestMin;
            if (beta <= alpha) break;
        }
        if (searchAbort) return evaluateBoard();
        if (!bestMove && moves.length) bestMove = [moves[0][0], moves[0][1]];
        var minFlag = TT_EXACT;
        if (bestMin <= alphaOrig) minFlag = TT_UPPER;
        else if (bestMin >= betaOrig) minFlag = TT_LOWER;
        tt[key] = { depth: depth, score: bestMin, flag: minFlag, bestMove: bestMove };
        return bestMin;
    }

    function chooseMoveFromScored(scored, clumsy) {
        if (!scored || !scored.length) return null;
        // Clumsy is applied at root candidate generation time.
        return [scored[0][0], scored[0][1]];
    }

    function resetSearchState() {
        tt = {};
        searchAbort = false;
        searchNodeCount = 0;
    }

    function scoreRootMovesAtDepth(depth, hardDeadlineMs, clumsy) {
        if (typeof clumsy !== 'undefined' && clumsy !== null) configureRootClumsy(clumsy);
        resetSearchState();
        searchDeadline = Date.now() + hardDeadlineMs;
        searchRootPly = history.length;
        var moves = generateCandidates(X, depth, null);
        var scored = [];
        var i;
        var alpha = -INF;
        for (i = 0; i < moves.length; i++) {
            if (Date.now() >= searchDeadline) {
                searchAbort = true;
                break;
            }
            var m = moves[i];
            applyMove(m[0], m[1], X);
            var score;
            if (hasFiveFrom(m[0], m[1], X)) score = WIN_SCORE * 2;
            else score = minimax(depth - 1, alpha, INF, false);
            undoMove();
            if (searchAbort) break;
            scored.push([m[0], m[1], score]);
            if (score > alpha) alpha = score;
        }
        scored.sort(function (a, b) { return b[2] - a[2]; });
        return {
            depth: depth,
            timedOut: searchAbort,
            scored: scored,
            nodeCount: searchNodeCount
        };
    }

    function iterativeRootScoring(targetDepth, softMs, hardMs, clumsy) {
        var startMs = Date.now();
        var softDeadline = startMs + softMs;
        var hardDeadline = startMs + hardMs;
        var d;
        var last = null;
        configureRootClumsy(clumsy);
        for (d = 1; d <= targetDepth; d++) {
            if (Date.now() >= hardDeadline) break;
            if (d > 1 && Date.now() >= softDeadline) break;
            last = scoreRootMovesAtDepth(d, Math.max(1, hardDeadline - Date.now()), null);
            if (last.timedOut) break;
        }
        return {
            reachedDepth: last ? last.depth : 0,
            elapsedMs: Date.now() - startMs,
            last: last
        };
    }

    function startIterativeSession(targetDepth, softMs, hardMs, clumsy) {
        var now = Date.now();
        searchRootPly = history.length;
        configureRootClumsy(clumsy);
        return {
            startMs: now,
            softDeadline: now + softMs,
            hardDeadline: now + hardMs,
            targetDepth: targetDepth,
            depth: 1,
            reachedDepth: 0,
            bestMove: null,
            bestScore: 0,
            bestScored: null,
            depthMoves: null,
            depthIndex: 0,
            depthScored: [],
            depthAlpha: -INF,
            depthFinished: false,
            done: false
        };
    }

    function startDepthSession(session) {
        session.depthMoves = generateCandidates(X, session.depth, session.bestMove);
        session.depthIndex = 0;
        session.depthScored = [];
        session.depthAlpha = -INF;
        session.depthFinished = !session.depthMoves.length;
        searchDeadline = session.hardDeadline;
        searchAbort = false;
        searchNodeCount = 0;
    }

    function stepIterativeSession(session, sliceMs) {
        if (!session || session.done) return { done: true, session: session };
        if (Date.now() >= session.hardDeadline) {
            session.done = true;
            return { done: true, session: session };
        }

        if (!session.depthMoves || session.depthFinished) startDepthSession(session);
        var endMs = Date.now() + Math.max(1, sliceMs || 10);
        while (!session.depthFinished && Date.now() < endMs) {
            if (Date.now() >= session.hardDeadline) {
                searchAbort = true;
                session.depthFinished = true;
                break;
            }
            var m = session.depthMoves[session.depthIndex];
            session.depthIndex++;
            applyMove(m[0], m[1], X);
            var score;
            if (hasFiveFrom(m[0], m[1], X)) score = WIN_SCORE * 2;
            else score = minimax(session.depth - 1, session.depthAlpha, INF, false);
            undoMove();
            if (searchAbort) {
                session.depthFinished = true;
                break;
            }
            session.depthScored.push([m[0], m[1], score]);
            if (score > session.depthAlpha) session.depthAlpha = score;
            if (session.depthIndex >= session.depthMoves.length) session.depthFinished = true;
        }

        if (!session.depthFinished) return { done: false, session: session };

        if (session.depthScored.length) {
            session.depthScored.sort(function (a, b) { return b[2] - a[2]; });
            session.bestScored = session.depthScored;
            session.bestScore = session.depthScored[0][2];
            session.bestMove = [session.depthScored[0][0], session.depthScored[0][1]];
            session.reachedDepth = session.depth;
        }

        if (Date.now() >= session.hardDeadline || session.depth >= session.targetDepth || Date.now() >= session.softDeadline) {
            session.done = true;
            return { done: true, session: session };
        }

        session.depth++;
        session.depthMoves = null;
        session.depthFinished = false;
        return { done: false, session: session };
    }

    function loadFromAscii(rows7) {
        var r;
        var c;
        var inRows = rows7.length;
        var inCols = rows7.length ? rows7[0].length : 0;
        var startR = Math.max(0, Math.floor((ROWS - inRows) / 2));
        var startC = Math.max(0, Math.floor((COLS - inCols) / 2));
        board = createBoard();
        influence = createInfluence();
        history = [];
        lastMove = null;
        stoneCount = 0;
        boardHash = 0;
        tt = {};
        for (r = 0; r < rows7.length; r++) {
            var line = rows7[r];
            for (c = 0; c < line.length; c++) {
                var ch = line.charAt(c);
                if (ch === 'X' || ch === 'O') {
                    var rr = r + startR;
                    var cc = c + startC;
                    if (!inBounds(rr, cc)) continue;
                    var p = ch === 'X' ? X : O;
                    board[rr][cc] = p;
                    stoneCount++;
                    boardHash = (boardHash ^ zobrist[p][rr * COLS + cc]) >>> 0;
                }
            }
        }
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                if (board[r][c] !== EMPTY) adjustInfluence(r, c, 1);
            }
        }
    }

    function loadFromBoardState(boardIn, lastHumanMoveIn) {
        var r;
        var c;
        board = createBoard();
        influence = createInfluence();
        history = [];
        lastMove = null;
        stoneCount = 0;
        boardHash = 0;
        tt = {};
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                var p = boardIn[r][c];
                if (p !== O && p !== X) continue;
                board[r][c] = p;
                stoneCount++;
                boardHash = (boardHash ^ zobrist[p][r * COLS + c]) >>> 0;
            }
        }
        for (r = 0; r < ROWS; r++) {
            for (c = 0; c < COLS; c++) {
                if (board[r][c] !== EMPTY) adjustInfluence(r, c, 1);
            }
        }
        if (lastHumanMoveIn && lastHumanMoveIn.length === 3) {
            lastMove = [lastHumanMoveIn[0], lastHumanMoveIn[1], lastHumanMoveIn[2]];
            history = [lastMove];
        }
    }

    function toExternalMove(m) {
        return {
            row: m[0] - 5,
            col: m[1] - 5,
            score: m[2]
        };
    }

    function topNExternal(scored, n) {
        var out = [];
        var i;
        for (i = 0; i < scored.length && i < n; i++) out.push(toExternalMove(scored[i]));
        return out;
    }

    return {
        constants: { ROWS: ROWS, COLS: COLS, EMPTY: EMPTY, O: O, X: X, NEED: NEED, WIN_SCORE: WIN_SCORE },
        loadFromAscii: loadFromAscii,
        loadFromBoardState: loadFromBoardState,
        scoreRootMovesAtDepth: scoreRootMovesAtDepth,
        iterativeRootScoring: iterativeRootScoring,
        startIterativeSession: startIterativeSession,
        stepIterativeSession: stepIterativeSession,
        chooseMoveFromScored: chooseMoveFromScored,
        generateCandidatesRaw: generateCandidatesRaw,
        topNExternal: topNExternal
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createEngine: createEngine
    };
} else if (typeof window !== 'undefined') {
    window.NACEngineLib = {
        createEngine: createEngine
    };
}
