'use strict';

function createEngine() {
    var SIZE = 20;
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
    var searchRootAnchorMove = null;
    var whitelistEnabled = false;
    var whitelistMinR = 0;
    var whitelistMaxR = 0;
    var whitelistMinC = 0;
    var whitelistMaxC = 0;

    function configureWhitelistFromAnchor() {
        if (!searchRootAnchorMove) {
            whitelistEnabled = false;
            return;
        }
        whitelistEnabled = true;
        whitelistMinR = Math.max(0, searchRootAnchorMove[0] - 5);
        whitelistMaxR = Math.min(SIZE - 1, searchRootAnchorMove[0] + 5);
        whitelistMinC = Math.max(0, searchRootAnchorMove[1] - 5);
        whitelistMaxC = Math.min(SIZE - 1, searchRootAnchorMove[1] + 5);
    }

    function createBoard() {
        var b = [];
        var r;
        var c;
        for (r = 0; r < SIZE; r++) {
            b[r] = [];
            for (c = 0; c < SIZE; c++) b[r][c] = EMPTY;
        }
        return b;
    }

    function createInfluence() {
        var inf = [];
        var r;
        var c;
        for (r = 0; r < SIZE; r++) {
            inf[r] = [];
            for (c = 0; c < SIZE; c++) inf[r][c] = 0;
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
        for (i = 0; i < SIZE * SIZE; i++) {
            z[O][i] = rand32();
            z[X][i] = rand32();
        }
        return z;
    }

    function inBounds(r, c) {
        return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
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
        return stoneCount >= SIZE * SIZE;
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
        boardHash = (boardHash ^ zobrist[player][r * SIZE + c]) >>> 0;
        adjustInfluence(r, c, 1);
    }

    function undoMove() {
        var m = history.pop();
        if (!m) return null;
        board[m[0]][m[1]] = EMPTY;
        lastMove = history.length ? history[history.length - 1] : null;
        stoneCount--;
        boardHash = (boardHash ^ zobrist[m[2]][m[0] * SIZE + m[1]]) >>> 0;
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
        for (r = 0; r < SIZE; r++) {
            for (c = 0; c < SIZE; c++) {
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
        var best = 0;
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
                best = 3;
                break;
            }
            if (count >= 4 && openEnds >= 1) {
                if (best < 2) best = 2;
            } else if (count >= 3 && openEnds === 2) {
                if (best < 1) best = 1;
            }
        }
        board[r][c] = EMPTY;
        return best;
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
        var center = Math.floor(SIZE / 2);
        var opp = player === X ? O : X;
        var r;
        var c;
        var limit;
        if (!stoneCount) {
            moves.push([center, center]);
            return moves;
        }
        for (r = 0; r < SIZE; r++) {
            for (c = 0; c < SIZE; c++) {
                if (board[r][c] !== EMPTY) continue;
                if (influence[r][c] <= 0) continue;
                var priority = localShapeScore(r, c, player) + influence[r][c] * 3;
                var selfWin = isWinningMove(r, c, player);
                var oppWin = false;
                var selfThreat;
                var oppThreat;
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
                    mustMap[r * SIZE + c] = true;
                }

                // Keep local tactical follow-ups near the most recent move.
                if (whitelistEnabled &&
                    r >= whitelistMinR && r <= whitelistMaxR &&
                    c >= whitelistMinC && c <= whitelistMaxC) {
                    mustMap[r * SIZE + c] = true;
                }
                priority -= Math.abs(r - center) + Math.abs(c - center);
                moves.push([r, c, priority]);
            }
        }
        moves.sort(function (a, b) { return b[2] - a[2]; });
        prioritizeTTMove(moves, ttMove);
        if (applyLimit) {
            if (depthLeft >= 4) limit = 10;
            else if (depthLeft === 3) limit = 12;
            else limit = 16;
            if (moves.length > limit) {
                var kept = [];
                var seen = {};
                var i;
                var key;
                for (i = 0; i < moves.length; i++) {
                    key = moves[i][0] * SIZE + moves[i][1];
                    if (!mustMap[key]) continue;
                    kept.push(moves[i]);
                    seen[key] = true;
                }
                for (i = 0; i < moves.length && kept.length < limit; i++) {
                    key = moves[i][0] * SIZE + moves[i][1];
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
        var chooseBad = Math.random() < (clumsy / 100);
        if (!chooseBad || scored.length < 2) return [scored[0][0], scored[0][1]];
        return [scored[1][0], scored[1][1]];
    }

    function resetSearchState() {
        tt = {};
        searchAbort = false;
        searchNodeCount = 0;
    }

    function scoreRootMovesAtDepth(depth, hardDeadlineMs) {
        resetSearchState();
        searchDeadline = Date.now() + hardDeadlineMs;
        searchRootAnchorMove = lastMove ? [lastMove[0], lastMove[1], lastMove[2]] : null;
        configureWhitelistFromAnchor();
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

    function iterativeRootScoring(targetDepth, softMs, hardMs) {
        var startMs = Date.now();
        var softDeadline = startMs + softMs;
        var hardDeadline = startMs + hardMs;
        var d;
        var last = null;
        for (d = 1; d <= targetDepth; d++) {
            if (Date.now() >= hardDeadline) break;
            if (d > 1 && Date.now() >= softDeadline) break;
            last = scoreRootMovesAtDepth(d, Math.max(1, hardDeadline - Date.now()));
            if (last.timedOut) break;
        }
        return {
            reachedDepth: last ? last.depth : 0,
            elapsedMs: Date.now() - startMs,
            last: last
        };
    }

    function startIterativeSession(targetDepth, softMs, hardMs) {
        var now = Date.now();
        searchRootAnchorMove = lastMove ? [lastMove[0], lastMove[1], lastMove[2]] : null;
        configureWhitelistFromAnchor();
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
                    var rr = r + 6;
                    var cc = c + 6;
                    var p = ch === 'X' ? X : O;
                    board[rr][cc] = p;
                    stoneCount++;
                    boardHash = (boardHash ^ zobrist[p][rr * SIZE + cc]) >>> 0;
                }
            }
        }
        for (r = 0; r < SIZE; r++) {
            for (c = 0; c < SIZE; c++) {
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
        for (r = 0; r < SIZE; r++) {
            for (c = 0; c < SIZE; c++) {
                var p = boardIn[r][c];
                if (p !== O && p !== X) continue;
                board[r][c] = p;
                stoneCount++;
                boardHash = (boardHash ^ zobrist[p][r * SIZE + c]) >>> 0;
            }
        }
        for (r = 0; r < SIZE; r++) {
            for (c = 0; c < SIZE; c++) {
                if (board[r][c] !== EMPTY) adjustInfluence(r, c, 1);
            }
        }
        if (lastHumanMoveIn && lastHumanMoveIn.length === 3) {
            lastMove = [lastHumanMoveIn[0], lastHumanMoveIn[1], lastHumanMoveIn[2]];
            history = [lastMove];
            searchRootAnchorMove = [lastMove[0], lastMove[1], lastMove[2]];
            configureWhitelistFromAnchor();
        } else {
            searchRootAnchorMove = null;
            configureWhitelistFromAnchor();
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
        constants: { SIZE: SIZE, EMPTY: EMPTY, O: O, X: X, NEED: NEED, WIN_SCORE: WIN_SCORE },
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
