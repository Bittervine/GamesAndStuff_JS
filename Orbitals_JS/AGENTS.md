- Maintain clean separation between presentaion layer (Orbitals_JS.html and Orbitals_JS.js) and game logic/behavior (Orbitals_Sim.js)
- Maintain the testbench orbitals_testbench.mjs
- For this folder, Playwright may only be used on expressed permission. The testbench shall be used instead.
- No magic numbers! All constants that accept gameplay shall be in orbitals_config.js and this shall be the only definition! If individual testcases makes it absolutely neccesary to be able to change the parameters for a test, then go ahead and let the testcase reassign the values (then the config does not have to be const).

