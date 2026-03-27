(function () {
  "use strict";

  var EXPECTED_NODE_COUNT = 60;
  var EXPECTED_MAX_TURNS = 20;
  var STORY_SCRIPT_MIN = 1;
  var STORY_SCRIPT_MAX = 100;
  var STORY_SCRIPT_PREFIX = "ranger2_story";
  var STORY_SCRIPT_SUFFIX = ".js";

  var state = {
    stories: [],
    story: null,
    nodesById: {},
    currentNodeId: null,
    turn: 1,
    goodScore: 0,
    failAttempts: 0,
    choices: [],
    pendingFail: null,
    runState: "idle"
  };

  var els = {
    loadingPanel: document.getElementById("loadingPanel"),
    loadingText: document.getElementById("loadingText"),
    pickerPanel: document.getElementById("pickerPanel"),
    storyList: document.getElementById("storyList"),
    gamePanel: document.getElementById("gamePanel"),
    backToMenuBtn: document.getElementById("backToMenuBtn"),
    statusLine: document.getElementById("statusLine"),
    turnCard: document.getElementById("turnCard"),
    failOverlay: document.getElementById("failOverlay"),
    failTitle: document.getElementById("failTitle"),
    failText: document.getElementById("failText"),
    undoFailBtn: document.getElementById("undoFailBtn"),
    acceptFailBtn: document.getElementById("acceptFailBtn")
  };

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function addClass(el, cls) {
    if (!el) {
      return;
    }
    if ((" " + el.className + " ").indexOf(" " + cls + " ") >= 0) {
      return;
    }
    el.className = el.className ? el.className + " " + cls : cls;
  }

  function removeClass(el, cls) {
    var clean;
    if (!el) {
      return;
    }
    clean = (" " + el.className + " ").replace(new RegExp(" " + cls + " ", "g"), " ");
    el.className = clean.replace(/^\s+|\s+$/g, "");
  }

  function setLoadingText(text, isError) {
    els.loadingText.textContent = text;
    els.loadingText.className = isError ? "load-error" : "";
  }

  function findById(list, id) {
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].id === id) {
        return list[i];
      }
    }
    return null;
  }

  function findByType(list, type) {
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].type === type) {
        return list[i];
      }
    }
    return null;
  }

  function closestWithAttr(target, attr) {
    while (target && target !== document.body) {
      if (target.getAttribute && target.getAttribute(attr) !== null) {
        return target;
      }
      target = target.parentNode;
    }
    return null;
  }

  function validateStory(story, index) {
    var nodeMap = {};
    var turnCounts = [];
    var i;
    var j;

    assert(story && typeof story === "object", "Story at index " + index + " is not an object.");
    assert(typeof story.id === "string" && story.id, "Story at index " + index + " has invalid id.");
    assert(typeof story.title === "string" && story.title, "Story " + story.id + " has invalid title.");
    assert(Number(story.maxTurns) === EXPECTED_MAX_TURNS, "Story " + story.id + " must have maxTurns = 20.");
    assert(Array.isArray(story.nodes), "Story " + story.id + " nodes must be an array.");
    assert(story.nodes.length === EXPECTED_NODE_COUNT, "Story " + story.id + " must have exactly 60 nodes.");
    assert(typeof story.startNodeId === "string" && story.startNodeId, "Story " + story.id + " has invalid startNodeId.");
    assert(typeof story.goodScoreThreshold === "number", "Story " + story.id + " must have goodScoreThreshold.");
    assert(story.epilogues && typeof story.epilogues === "object", "Story " + story.id + " missing epilogues.");
    assert(typeof story.epilogues.high === "string", "Story " + story.id + " missing epilogues.high.");
    assert(typeof story.epilogues.low === "string", "Story " + story.id + " missing epilogues.low.");

    for (i = 0; i < story.nodes.length; i += 1) {
      var node = story.nodes[i];
      var failCount = 0;
      var normalCount = 0;
      var goodCount = 0;

      assert(node && typeof node === "object", "Story " + story.id + " contains invalid node.");
      assert(typeof node.id === "string" && node.id, "Story " + story.id + " contains node with invalid id.");
      assert(!hasOwn(nodeMap, node.id), "Story " + story.id + " has duplicate node id " + node.id + ".");
      assert(Number(node.turn) === parseInt(node.turn, 10), "Node " + node.id + " must have integer turn.");
      assert(node.turn >= 1 && node.turn <= story.maxTurns, "Node " + node.id + " turn out of range.");
      assert(typeof node.title === "string" && node.title, "Node " + node.id + " must have title.");
      assert(Array.isArray(node.narrative) && node.narrative.length === 3, "Node " + node.id + " must have exactly 3 narrative lines.");
      assert(Array.isArray(node.options) && node.options.length === 3, "Node " + node.id + " must have exactly 3 options.");

      for (j = 0; j < node.options.length; j += 1) {
        var opt = node.options[j];
        assert(opt && typeof opt === "object", "Node " + node.id + " has invalid option.");
        assert(typeof opt.id === "string" && opt.id, "Node " + node.id + " has option with invalid id.");
        assert(typeof opt.type === "string", "Node " + node.id + " has option with invalid type.");
        assert(typeof opt.label === "string" && opt.label, "Node " + node.id + " has option with invalid label.");

        if (opt.type === "fail") {
          failCount += 1;
          assert(typeof opt.failTitle === "string", "Node " + node.id + " fail option missing failTitle.");
          assert(typeof opt.failText === "string", "Node " + node.id + " fail option missing failText.");
        } else if (opt.type === "normal") {
          normalCount += 1;
          if (node.turn < story.maxTurns && opt.endStory !== true) {
            assert(typeof opt.nextNodeId === "string" && opt.nextNodeId, "Node " + node.id + " normal option missing nextNodeId.");
          }
        } else if (opt.type === "good") {
          goodCount += 1;
          if (node.turn < story.maxTurns && opt.endStory !== true) {
            assert(typeof opt.nextNodeId === "string" && opt.nextNodeId, "Node " + node.id + " good option missing nextNodeId.");
          }
        } else {
          throw new Error("Node " + node.id + " has unknown option type " + opt.type + ".");
        }
      }

      assert(failCount === 1 && normalCount === 1 && goodCount === 1, "Node " + node.id + " must have one fail, one normal, one good option.");

      nodeMap[node.id] = node;
      turnCounts[node.turn] = (turnCounts[node.turn] || 0) + 1;
    }

    for (i = 1; i <= story.maxTurns; i += 1) {
      assert(turnCounts[i] === 3, "Story " + story.id + " must have exactly 3 nodes for turn " + i + ".");
    }

    assert(hasOwn(nodeMap, story.startNodeId), "Story " + story.id + " startNodeId not found.");
    assert(nodeMap[story.startNodeId].turn === 1, "Story " + story.id + " startNodeId must be turn 1.");

    for (i = 0; i < story.nodes.length; i += 1) {
      var src = story.nodes[i];
      for (j = 0; j < src.options.length; j += 1) {
        var option = src.options[j];
        var target;
        if (option.type === "fail" || option.endStory === true || src.turn === story.maxTurns) {
          continue;
        }
        target = nodeMap[option.nextNodeId];
        assert(target, "Node " + src.id + " points to missing node " + option.nextNodeId + ".");
        assert(target.turn === src.turn + 1, "Node " + src.id + " option " + option.type + " must point to turn " + (src.turn + 1) + ".");
      }
    }

    story.__nodeMap = nodeMap;
  }

  function validateData(data) {
    var i;
    assert(data && typeof data === "object", "Story data must be an object.");
    assert(Array.isArray(data.stories), "Story data must contain stories array.");
    assert(data.stories.length > 0, "stories array is empty.");
    for (i = 0; i < data.stories.length; i += 1) {
      validateStory(data.stories[i], i);
    }
  }

  function validateStoryArray(stories) {
    var i;
    assert(Array.isArray(stories), "Story list must be an array.");
    assert(stories.length > 0, "Story list is empty.");
    for (i = 0; i < stories.length; i += 1) {
      validateStory(stories[i], i);
    }
  }

  function collectValidStories(stories) {
    var validStories = [];
    var seenIds = {};
    var i;

    assert(Array.isArray(stories), "Story list must be an array.");

    for (i = 0; i < stories.length; i += 1) {
      try {
        validateStory(stories[i], i);
        assert(!hasOwn(seenIds, stories[i].id), "Duplicate story id " + stories[i].id + ".");
        seenIds[stories[i].id] = true;
        validStories.push(stories[i]);
      } catch (err) {
        if (window.console && typeof window.console.warn === "function") {
          window.console.warn("Skipping invalid story at index " + i + ": " + err.message);
        }
      }
    }

    assert(validStories.length > 0, "No valid story scripts loaded. Ensure files named ranger2_story1.js through ranger2_story100.js are in the same folder.");
    return validStories;
  }

  function buildStoryScriptName(index) {
    return STORY_SCRIPT_PREFIX + index + STORY_SCRIPT_SUFFIX;
  }

  function loadStoryScripts(done) {
    var current = STORY_SCRIPT_MIN;
    var loadedCount = 0;

    function next() {
      if (current > STORY_SCRIPT_MAX) {
        done(loadedCount);
        return;
      }
      loadStoryScript(current, function (loaded) {
        if (loaded) {
          loadedCount += 1;
        }
        current += 1;
        next();
      });
    }

    next();
  }

  function loadStoryScript(index, done) {
    var script = document.createElement("script");
    var scriptName = buildStoryScriptName(index);
    var scriptSrc = scriptName;
    var finished = false;

    setLoadingText("Reading local story scripts... (" + index + "/" + STORY_SCRIPT_MAX + ")", false);

    function cleanupAndDone(loaded) {
      if (finished) {
        return;
      }
      finished = true;
      window.removeEventListener("error", onWindowError, true);
      script.onload = null;
      script.onerror = null;
      done(loaded);
    }

    function onWindowError(event) {
      var filename = event && event.filename ? String(event.filename) : "";
      if (filename && filename.indexOf(scriptName) >= 0) {
        cleanupAndDone(false);
      }
    }

    window.addEventListener("error", onWindowError, true);
    script.async = false;
    script.onload = function () {
      cleanupAndDone(true);
    };
    script.onerror = function () {
      cleanupAndDone(false);
    };
    script.src = scriptSrc;
    (document.head || document.body || document.documentElement).appendChild(script);
  }

  function showPicker() {
    addClass(els.loadingPanel, "hidden");
    removeClass(els.pickerPanel, "hidden");
    addClass(els.gamePanel, "hidden");
  }

  function showGame() {
    addClass(els.loadingPanel, "hidden");
    addClass(els.pickerPanel, "hidden");
    removeClass(els.gamePanel, "hidden");
  }

  function hideFailOverlay() {
    addClass(els.failOverlay, "hidden");
    els.failOverlay.setAttribute("aria-hidden", "true");
  }

  function showFailOverlay(failOption) {
    els.failTitle.textContent = failOption.failTitle;
    els.failText.textContent = failOption.failText;
    removeClass(els.failOverlay, "hidden");
    els.failOverlay.setAttribute("aria-hidden", "false");
  }

  function updateStatusLine() {
    if (!state.story || state.runState !== "running") {
      els.statusLine.textContent = "";
      return;
    }
    els.statusLine.textContent =
      "Turn " +
      state.turn +
      "/" +
      state.story.maxTurns +
      " | Good score " +
      state.goodScore +
      " | Fail attempts " +
      state.failAttempts;
  }

  function renderStoryPicker() {
    var i;
    var html = "";
    for (i = 0; i < state.stories.length; i += 1) {
      var story = state.stories[i];
      html +=
        '<article class="story-card">' +
        "<h3>" +
        escapeHtml(story.title) +
        "</h3>" +
        "<p>" +
        escapeHtml(story.summary || "") +
        "</p>" +
        "<p>" +
        "Nodes: " +
        story.nodes.length +
        " | Max turns: " +
        story.maxTurns +
        "</p>" +
        '<button type="button" data-play-story="' +
        escapeHtml(story.id) +
        '">Start Story</button>' +
        "</article>";
    }
    els.storyList.innerHTML = html;
  }

  function resolveEndingType(triggerOption) {
    if (triggerOption && (triggerOption.endType === "high" || triggerOption.endType === "low")) {
      return triggerOption.endType;
    }
    return state.goodScore >= state.story.goodScoreThreshold ? "high" : "low";
  }

  function renderEpilogue(triggerOption, endedEarly) {
    var i;
    var goodCount = 0;
    var normalCount = 0;
    var endingType;
    var epilogueText;
    var html;

    hideFailOverlay();
    state.runState = "ended";
    updateStatusLine();

    for (i = 0; i < state.choices.length; i += 1) {
      if (state.choices[i].type === "good") {
        goodCount += 1;
      } else if (state.choices[i].type === "normal") {
        normalCount += 1;
      }
    }

    endingType = resolveEndingType(triggerOption);
    epilogueText = state.story.epilogues[endingType];

    html =
      '<section class="final-card">' +
      "<h4>Epilogue</h4>" +
      "<p>" +
      escapeHtml(epilogueText) +
      "</p>" +
      "<p>" +
      "Ending: " +
      (endingType === "high" ? "High Resolution" : "Low Resolution") +
      (endedEarly ? " (early conclusion)" : "") +
      "." +
      "</p>" +
      "<p>" +
      "Turns played: " +
      state.choices.length +
      " | Good picks: " +
      goodCount +
      " | Normal picks: " +
      normalCount +
      " | Fail attempts: " +
      state.failAttempts +
      " | Good score: " +
      state.goodScore +
      "." +
      "</p>" +
      '<div class="final-actions">' +
      '<button type="button" data-restart-story="1">Restart Story</button>' +
      '<button type="button" data-back-menu="1">Choose Another Story</button>' +
      "</div>" +
      "</section>";

    els.turnCard.innerHTML = html;
  }

  function renderFatalRun(failOption) {
    var html;
    hideFailOverlay();
    state.runState = "ended";
    updateStatusLine();

    html =
      '<section class="final-card">' +
      "<h4>" +
      escapeHtml(failOption.failTitle) +
      "</h4>" +
      "<p>" +
      escapeHtml(failOption.failText) +
      "</p>" +
      "<p>" +
      "Run ended at turn " +
      state.turn +
      ". You can restart or choose a different story." +
      "</p>" +
      '<div class="final-actions">' +
      '<button type="button" data-restart-story="1">Restart Story</button>' +
      '<button type="button" data-back-menu="1">Choose Another Story</button>' +
      "</div>" +
      "</section>";

    els.turnCard.innerHTML = html;
  }

  function renderFatalSystemError(message) {
    hideFailOverlay();
    state.runState = "ended";
    els.turnCard.innerHTML =
      '<section class="final-card">' +
      "<h4>System Error</h4>" +
      "<p>" +
      escapeHtml(message) +
      "</p>" +
      '<div class="final-actions">' +
      '<button type="button" data-back-menu="1">Back to Story Menu</button>' +
      "</div>" +
      "</section>";
  }

  function renderNode() {
    var node = state.nodesById[state.currentNodeId];
    var optionsHtml = "";
    var narrativeHtml = "";
    var i;
    var html;

    if (!node) {
      renderFatalSystemError("Current node " + state.currentNodeId + " could not be found.");
      return;
    }

    state.turn = node.turn;
    state.runState = "running";
    updateStatusLine();

    for (i = 0; i < node.narrative.length; i += 1) {
      narrativeHtml += "<p>" + node.narrative[i] + "</p>";
    }

    for (i = 0; i < node.options.length; i += 1) {
      var opt = node.options[i];
      optionsHtml +=
        "<li>" +
        '<button type="button" class="option-btn" data-type="' +
        escapeHtml(opt.type) +
        '" data-option-id="' +
        escapeHtml(opt.id) +
        '">' +
        escapeHtml(opt.label) +
        "</button>" +
        "</li>";
    }

    html =
      "<h3>" +
      escapeHtml(node.title) +
      '</h3>' +
      '<div class="turn-meta">Node ' +
      escapeHtml(node.id) +
      " | Early endings are possible from some choices.</div>" +
      "<hr>" +
      '<div class="narrative">' +
      narrativeHtml +
      "</div>" +
      "<hr>" +
      '<ul class="option-list">' +
      optionsHtml +
      "</ul>";

    els.turnCard.innerHTML = html;
  }

  function moveWithOption(option) {
    var nextNode;
    var delta = Number(option.scoreDelta) || 0;

    state.goodScore += delta;
    state.choices.push({
      turn: state.turn,
      nodeId: state.currentNodeId,
      type: option.type,
      label: option.label,
      scoreDelta: delta
    });

    if (option.endStory === true) {
      renderEpilogue(option, true);
      return;
    }

    if (state.turn >= state.story.maxTurns) {
      renderEpilogue(option, false);
      return;
    }

    if (!option.nextNodeId) {
      renderFatalSystemError("Option " + option.id + " from node " + state.currentNodeId + " has no nextNodeId.");
      return;
    }

    nextNode = state.nodesById[option.nextNodeId];
    if (!nextNode) {
      renderFatalSystemError("Missing target node " + option.nextNodeId + ".");
      return;
    }
    state.currentNodeId = nextNode.id;
    state.turn = nextNode.turn;
    renderNode();
  }

  function handleOptionSelection(optionId) {
    var node;
    var option;
    if (state.runState !== "running") {
      return;
    }
    node = state.nodesById[state.currentNodeId];
    if (!node) {
      return;
    }
    option = findById(node.options, optionId);
    if (!option) {
      return;
    }

    if (option.type === "fail") {
      state.failAttempts += 1;
      state.pendingFail = option;
      showFailOverlay(option);
      updateStatusLine();
      return;
    }

    hideFailOverlay();
    moveWithOption(option);
  }

  function startStory(storyId) {
    var story = findById(state.stories, storyId);
    if (!story) {
      return;
    }

    state.story = story;
    state.nodesById = story.__nodeMap;
    state.currentNodeId = story.startNodeId;
    state.turn = 1;
    state.goodScore = 0;
    state.failAttempts = 0;
    state.choices = [];
    state.pendingFail = null;
    state.runState = "running";

    hideFailOverlay();
    showGame();
    renderNode();
  }

  function backToMenu() {
    hideFailOverlay();
    state.story = null;
    state.nodesById = {};
    state.currentNodeId = null;
    state.runState = "idle";
    state.pendingFail = null;
    els.turnCard.innerHTML = "";
    els.statusLine.textContent = "";
    showPicker();
  }

  function onClick(event) {
    var playButton = closestWithAttr(event.target, "data-play-story");
    var optionButton = closestWithAttr(event.target, "data-option-id");
    var restartButton = closestWithAttr(event.target, "data-restart-story");
    var backButton = closestWithAttr(event.target, "data-back-menu");

    if (playButton) {
      startStory(playButton.getAttribute("data-play-story"));
      return;
    }

    if (optionButton) {
      handleOptionSelection(optionButton.getAttribute("data-option-id"));
      return;
    }

    if (restartButton && state.story) {
      startStory(state.story.id);
      return;
    }

    if (backButton) {
      backToMenu();
    }
  }

  function initDataFromGlobal() {
    var storyArray = window.RANGER2_STORIES;
    var data = window.RANGER2_STORY_DATA;

    if (storyArray) {
      state.stories = collectValidStories(storyArray);
      return;
    }

    if (!data) {
      throw new Error("No story scripts loaded. Ensure files named ranger2_story1.js through ranger2_story100.js are in the same folder.");
    }
    assert(data && typeof data === "object", "Story data must be an object.");
    assert(Array.isArray(data.stories), "Story data must contain stories array.");
    state.stories = collectValidStories(data.stories);
  }

  function init() {
    function bootGame() {
      try {
        initDataFromGlobal();
        renderStoryPicker();
        showPicker();
      } catch (err) {
        setLoadingText(err.message, true);
        removeClass(els.loadingPanel, "hidden");
        addClass(els.pickerPanel, "hidden");
        addClass(els.gamePanel, "hidden");
      }
    }

    document.addEventListener("click", onClick);
    els.backToMenuBtn.addEventListener("click", backToMenu);
    els.undoFailBtn.addEventListener("click", function () {
      hideFailOverlay();
    });
    els.acceptFailBtn.addEventListener("click", function () {
      if (state.pendingFail) {
        renderFatalRun(state.pendingFail);
      }
    });

    if ((window.RANGER2_STORIES && window.RANGER2_STORIES.length > 0) || window.RANGER2_STORY_DATA) {
      bootGame();
      return;
    }

    loadStoryScripts(function () {
      bootGame();
    });
  }

  init();
})();
