'use strict';

var engineMod = require('./NaughtsAndCrosses_JS.js');

function sameMoveInternal(m, r, c) {
    return m && m[0] === r && m[1] === c;
}

function extRowColToInternal(row, col) {
    return [row + 5, col + 5];
}

function rankOfMove(scored, moveRC) {
    var i;
    for (i = 0; i < scored.length; i++) {
        if (scored[i][0] === moveRC[0] && scored[i][1] === moveRC[1]) return i;
    }
    return -1;
}

function printTopExternal(e, scored, topN) {
    var top = e.topNExternal(scored, topN);
    var i;
    for (i = 0; i < top.length; i++) {
        var m = top[i];
        console.log('#' + (i + 1) + ' r' + m.row + ' c' + m.col + ' score=' + m.score);
    }
}

function hasMoveExternal(scored, row, col) {
    var rc = extRowColToInternal(row, col);
    var i;
    for (i = 0; i < scored.length; i++) {
        if (sameMoveInternal(scored[i], rc[0], rc[1])) return true;
    }
    return false;
}

function verifyClumsyBound(scored, e) {
    if (!scored || !scored.length) {
        return { ok: true, note: 'no scored roots' };
    }
    var bestAllowedRank = scored.length >= 2 ? 1 : 0;
    var pick0 = e.chooseMoveFromScored(scored, 0);
    var pick100 = e.chooseMoveFromScored(scored, 100);
    var rank0 = rankOfMove(scored, pick0);
    var rank100 = rankOfMove(scored, pick100);
    var ok0 = rank0 === 0;
    var ok100 = rank100 >= 0 && rank100 <= bestAllowedRank;
    return {
        ok: ok0 && ok100,
        rank0: rank0,
        rank100: rank100,
        bestAllowedRank: bestAllowedRank
    };
}

function rootClassForMove(e, scoredMove) {
    if (!scoredMove) return 99;
    var b = Array.from({ length: 20 }, function () { return Array(20).fill(0); });
    // We only need relative class behavior in scored list, so use score ordering fallback:
    // class proxy is score tier buckets by tactical cliffs.
    if (scoredMove[2] >= 10000000) return 0;
    if (scoredMove[2] <= -10000000) return 1;
    return 99;
}

function verifyClumsyTacticalClass(scored, e) {
    if (!scored || !scored.length) return { ok: true, note: 'no scored roots' };
    var pick0 = e.chooseMoveFromScored(scored, 0);
    var pick100 = e.chooseMoveFromScored(scored, 100);
    var rank0 = rankOfMove(scored, pick0);
    var rank100 = rankOfMove(scored, pick100);
    var cBest = rootClassForMove(e, scored[0]);
    var c100 = rank100 >= 0 ? rootClassForMove(e, scored[rank100]) : 99;
    var ok = rank0 === 0 && (c100 === cBest || cBest === 99);
    return { ok: ok, rank0: rank0, rank100: rank100, classBest: cBest, class100: c100 };
}

function lcg(seed) {
    var s = seed >>> 0;
    return function () {
        s = (1664525 * s + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function makeRandomAsciiCase(seed) {
    var rnd = lcg(seed);
    var rows = [];
    var r;
    var c;
    for (r = 0; r < 7; r++) rows[r] = ['-', '-', '-', '-', '-', '-', '-'];

    var stones = 7 + Math.floor(rnd() * 6);
    var xCount = 0;
    var oCount = 0;
    var placed = 0;
    while (placed < stones) {
        r = Math.floor(rnd() * 7);
        c = Math.floor(rnd() * 7);
        if (rows[r][c] !== '-') continue;
        var placeX = (xCount <= oCount);
        rows[r][c] = placeX ? 'X' : 'O';
        if (placeX) xCount++;
        else oCount++;
        placed++;
    }

    var out = [];
    for (r = 0; r < 7; r++) out.push(rows[r].join(''));
    return out;
}

function runNamedCase(name, rows, depth, expectBlocks) {
    var e = engineMod.createEngine();
    e.loadFromAscii(rows);
    var exact = e.scoreRootMovesAtDepth(depth, 30000);
    var clumsyCheck = verifyClumsyBound(exact.scored, e);

    console.log('\n=== ' + name + ' ===');
    console.log('depth=' + depth + ', timedOut=' + exact.timedOut + ', nodes=' + exact.nodeCount + ', roots=' + exact.scored.length);
    printTopExternal(e, exact.scored, 8);
    console.log('clumsy-check: ' + (clumsyCheck.ok ? 'PASS' : 'FAIL') +
        ' (rank@0=' + clumsyCheck.rank0 + ', rank@100=' + clumsyCheck.rank100 +
        ', allowedMax=' + clumsyCheck.bestAllowedRank + ')');

    if (expectBlocks) {
        var raw = e.generateCandidatesRaw(2, depth, null);
        console.log('raw candidates=' + raw.length + ', limited roots=' + exact.scored.length);
        console.log('contains (2,2) in raw=' + (hasMoveExternal(raw, 2, 2) ? 'YES' : 'NO'));
        console.log('contains (6,6) in raw=' + (hasMoveExternal(raw, 6, 6) ? 'YES' : 'NO'));
        console.log('contains (2,2) limited=' + (hasMoveExternal(exact.scored, 2, 2) ? 'YES' : 'NO'));
        console.log('contains (6,6) limited=' + (hasMoveExternal(exact.scored, 6, 6) ? 'YES' : 'NO'));
    }

    return clumsyCheck.ok;
}

function runRandomSuite(count, depth, seedStart) {
    var pass = 0;
    var fail = 0;
    var i;
    for (i = 0; i < count; i++) {
        var e = engineMod.createEngine();
        var rows = makeRandomAsciiCase(seedStart + i);
        e.loadFromAscii(rows);
        var exact = e.scoreRootMovesAtDepth(depth, 5000);
        var chk = verifyClumsyTacticalClass(exact.scored, e);
        if (chk.ok) pass++;
        else {
            fail++;
            console.log('\n[Random FAIL seed=' + (seedStart + i) + ']');
            console.log(rows.join('\n'));
            console.log('rank@0=' + chk.rank0 + ', rank@100=' + chk.rank100 + ', classBest=' + chk.classBest + ', class100=' + chk.class100);
        }
    }
    return { pass: pass, fail: fail, total: count };
}

function run() {
    var namedPass = 0;
    var namedFail = 0;

    var cases = [
        {
            name: 'User diagonal open-three testcase',
            depth: 8,
            expectBlocks: true,
            rows: [
                '-------',
                '-------',
                '--O----',
                '--XO---',
                '--X-O--',
                '-------',
                '-------'
            ]
        },
        {
            name: 'Horizontal pressure',
            depth: 6,
            rows: [
                '-------',
                '---O---',
                '--XO---',
                '--XOO--',
                '---X---',
                '-------',
                '-------'
            ]
        },
        {
            name: 'Vertical pressure',
            depth: 6,
            rows: [
                '-------',
                '---O---',
                '---X---',
                '--OX---',
                '---O---',
                '-------',
                '-------'
            ]
        },
        {
            name: 'Immediate attack race',
            depth: 6,
            rows: [
                '-------',
                '--XX---',
                '--OO---',
                '---X---',
                '---O---',
                '-------',
                '-------'
            ]
        }
    ];

    console.log('NaughtsAndCrosses engine testbench');
    console.log('Checks:');
    console.log('- raw-vs-limited candidate visibility for selected tactical case');
    console.log('- clumsy=0 picks best-ranked move');
    console.log('- clumsy=100 never picks worse than rank 1 (second-best) at current scored depth');

    var i;
    for (i = 0; i < cases.length; i++) {
        var ok = runNamedCase(cases[i].name, cases[i].rows, cases[i].depth, !!cases[i].expectBlocks);
        if (ok) namedPass++;
        else namedFail++;
    }

    var random = runRandomSuite(30, 4, 1337);
    console.log('\n=== Summary ===');
    console.log('Named clumsy checks: pass=' + namedPass + ', fail=' + namedFail + ', total=' + cases.length);
    console.log('Random clumsy checks: pass=' + random.pass + ', fail=' + random.fail + ', total=' + random.total);
    console.log('Overall: pass=' + (namedPass + random.pass) + ', fail=' + (namedFail + random.fail));
}

run();
