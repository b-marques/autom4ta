const ACCEPT_STATE = "☢";

export default class FA {
    constructor(states, alphabet, transitions, initial, finals) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitions = transitions;
        this.initial = initial;
        this.finals = finals;
        this.determinized = false;
    }

    reset() {
        this.states = new Set();
        this.alphabet = new Set();
        this.transitions = [];
        this.initial = "";
        this.finals = new Set();
        this.determinized = false;
    }

    buildFromGrammar(grammar) {
        this.reset();

        // If not valid don't build DFA
        if (!grammar.valid) return this;

        let epsilonAtInitial = false;

        // Treat epsilon
        for (let head in grammar.P) {
            if (head === grammar.S) {
                if (grammar.P[head].has("&")) epsilonAtInitial = true;
            } else {
                if (grammar.P[head].has("&")) {
                    alert("Should not have epsilon transitions in other productions than the initial");
                    this.reset();
                    return this;
                }
            }
        }

        // Prevent productions to a production with epsilon
        if (epsilonAtInitial) {
            for (let head in grammar.P) {
                grammar.P[head].forEach(element => {
                    if (element.length === 2 && element.charAt(1) === grammar.S) {
                        alert("Should not have a transition to the intial state having epsilon");
                        this.reset();
                        return this;
                    }
                });
            }
        }
        let states = new Set([...grammar.Vn, ACCEPT_STATE]);
        let alphabet = new Set([...grammar.Vt]);
        let transitions = [];
        let initial = grammar.S;
        let finals = epsilonAtInitial ? new Set([...grammar.S, ACCEPT_STATE]) : new Set([ACCEPT_STATE]);

        // Build transitions
        for (let state of states) {
            transitions[state] = [];
            for (let symbol of alphabet) {
                transitions[state][symbol] = { to: new Set(), text: " -" };
            }
        }
        for (let head in grammar.P) {
            grammar.P[head].forEach(element => {
                if (element.length === 1) {
                    transitions[head][element].to.add(ACCEPT_STATE);
                    transitions[head][element].text = " " + [...transitions[head][element].to].sort().join(", ");
                } else {
                    transitions[head][element.charAt(0)].to.add(element.charAt(1));
                    transitions[head][element.charAt(0)].text =
                        " " + [...transitions[head][element.charAt(0)].to].sort().join(", ");
                }
            });
        }
        this.states = states;
        this.alphabet = alphabet;
        this.transitions = transitions;
        this.initial = initial;
        this.finals = finals;
    }

    isDeterministic() {
        let alphabet = [...this.alphabet];
        let states = [...this.states];
        for (let state in states) {
            for (let symbol in alphabet) {
                if (this.transitions[states[state]][alphabet[symbol]].to.size > 1) {
                    return false;
                }
            }
        }
        return true;
    }

    addState(state) {
        if (!this.states.has(state)) {
            this.states.add(state);
            // Update transition array
            this.transitions[state] = [];
            for (let symbol of this.alphabet) {
                this.transitions[state][symbol] = { to: new Set(), text: " -" };
            }
        }
    }

    deleteState(state) {
        if (this.states.delete(state)) {
            // Refactor transitions
            for (let s of this.states) {
                for (let symbol of this.alphabet) {
                    this.transitions[s][symbol].to.delete(state);
                    this.transitions[s][symbol].text = this.transitions[s][symbol].to.size
                        ? " " + [...this.transitions[s][symbol].to].sort().join(", ")
                        : " -";
                }
            }
            delete this.transitions[state];
        }
    }

    addSymbol(symbol) {
        if (!this.alphabet.has(symbol)) {
            this.alphabet.add(symbol);
            // Update transition array
            for (let state of this.states) {
                this.transitions[state][symbol] = { to: new Set(), text: " -" };
            }
        }
    }

    deleteSymbol(symbol) {
        if (this.alphabet.delete(symbol)) {
            for (let state of this.states) {
                delete this.transitions[state][symbol];
            }
        }
    }

    setInitial(initial) {
        this.initial = initial;
    }

    addFinal(state) {
        this.finals.add(state);
    }
    removeFinal(state) {
        this.finals.delete(state);
    }

    updateTransition(state, value, symbol) {
        // Remove spaces from input
        value = value.replace(/[ \t\r]+/g, "");
        let regex = /^((-?([A-Z☢]))(,+([A-Z☢]))*)$/;
        if (!regex.test(value) && value !== "") {
            this.transitions[state][symbol].text = value;
            return false;
        }
        this.determinized = false;

        value = value.replace(/[ -]+/g, "");
        value = value.split(",");
        value = new Set(value.filter(element => element !== ""));

        [...value].forEach(element => {
            this.addState(element);
        });

        this.transitions[state][symbol].to = value;
        this.transitions[state][symbol].text = value.size ? " " + [...value].sort().join(", ") : " -";
    }

    hasInitial() {
        if (this.initial) return true;
        return false;
    }

    hasEpsilonTransition() {
        return this.alphabet.has("&");
    }

    buildEClosure(state, eclosure = new Set()) {
        eclosure.add(state);
        for (let each of this.transitions[state]["&"].to) {
            // This if prevent cycles
            if (!eclosure.has(each)) {
                eclosure.add(each);
                eclosure = this.buildEClosure(each, eclosure);
            }
        }

        return eclosure;
    }

    removeDeadStates() {
        let deletion_occur;
        do {
            deletion_occur = false;
            for (let state of this.states) {
                let counter = 0;
                for (let symbol of this.alphabet) {
                    counter += this.transitions[state][symbol].to.size;
                }
                if (!counter && !this.finals.has(state)) {
                    this.deleteState(state);
                    deletion_occur = true;
                }
            }
        } while (deletion_occur);

        // Remove possible unused transitions
        for (let symbol of this.alphabet) {
            let counter = 0;
            for (let state of this.states) {
                counter += this.transitions[state][symbol].to.size;
            }
            if (!counter) {
                this.deleteSymbol(symbol);
            }
        }
    }

    renameStates(available_letters) {
        if (available_letters === undefined) {
            available_letters = new Set();
            for (let i = 65; i < 91; i++) {
                available_letters.add(String.fromCharCode(i));
            }
        }

        let need_rename = new Set();

        for (let state of this.states) {
            if (state.length === 1) {
                if (available_letters.has(state)) {
                    available_letters.delete(state);
                } else {
                    need_rename.add(state);
                }
            } else {
                need_rename.add(state);
            }
        }
        let has_changed;
        do {
            has_changed = false;
            for (let state of this.states) {
                if (need_rename.has(state)) {
                    let selected_letter = [...available_letters][0];
                    available_letters.delete(selected_letter);
                    for (let s of this.states) {
                        for (let symbol of this.alphabet) {
                            if (state === this.transitions[s][symbol].text.slice(1)) {
                                this.transitions[s][symbol].text = " " + selected_letter;
                                this.transitions[s][symbol].to = new Set(selected_letter);
                            }
                        }
                    }
                    this.transitions[selected_letter] = this.transitions[state];
                    delete this.transitions[state];

                    this.states.delete(state);
                    this.states.add(selected_letter);
                    if (this.finals.delete(state)) {
                        this.finals.add(selected_letter);
                    }
                    if (this.initial === state) {
                        this.initial = selected_letter;
                    }
                    has_changed = true;
                }
            }
        } while (has_changed);
    }

    determinize() {
        let dfa = new FA();

        // Build eclosure
        let eclosure = [];
        if (this.hasEpsilonTransition()) {
            for (let state of this.states) {
                eclosure[state] = [...this.buildEClosure(state)].sort().join("");
            }
        } else {
            for (let state of this.states) {
                eclosure[state] = state;
            }
        }

        dfa.reset();
        for (let symbol of this.alphabet) {
            dfa.addSymbol(symbol);
        }
        dfa.deleteSymbol("&");
        dfa.addState(eclosure[this.initial]);
        dfa.initial = eclosure[this.initial];

        let old_length;
        do {
            old_length = dfa.states.size;

            // Build transitions
            for (let state of dfa.states) {
                for (let symbol of dfa.alphabet) {
                    // Build reachable states from actual
                    let composedDestiny = new Set();
                    // Split composed states and for each composed their "tos"
                    for (let each_state of state.split("")) {
                        for (let to of this.transitions[each_state][symbol].to) {
                            for (let element of eclosure[to].split("")) {
                                composedDestiny.add(element);
                            }
                        }
                    }

                    if (composedDestiny.size) {
                        // Convert destination to a string state
                        let composedState = [...composedDestiny].sort().join("");
                        dfa.addState(composedState);
                        dfa.transitions[state][symbol].to = new Set(composedState);
                        dfa.transitions[state][symbol].text = " " + composedState;
                        [...composedDestiny].forEach(element => {
                            if (this.finals.has(element)) {
                                dfa.finals.add(composedState);
                            }
                        });
                    }
                }
            }
        } while (old_length !== dfa.states.size);
        dfa.removeDeadStates();
        dfa.renameStates();
        dfa.determinized = true;
        return dfa;
    }

    union(dfaOriginal) {
        let dfa = new FA();
        dfa.states = new Set(dfaOriginal.states);
        dfa.alphabet = new Set(dfaOriginal.alphabet);
        dfa.transitions = [];
        for (let state of dfaOriginal.states) {
            dfa.transitions[state] = [];
            for (let symbol of dfaOriginal.alphabet) {
                dfa.transitions[state][symbol] = { to: new Set(), text: " -" };
                dfa.transitions[state][symbol].to = dfaOriginal.transitions[state][symbol].to;
                dfa.transitions[state][symbol].text = dfaOriginal.transitions[state][symbol].text;
            }
        }
        dfa.initial = dfaOriginal.initial.slice(0);
        dfa.finals = new Set(dfaOriginal.finals);
        dfa.determinized = false;

        let available_letters = new Set();
        // Generate all aplhabet letters
        for (let i = 65; i < 91; i++) {
            available_letters.add(String.fromCharCode(i));
        }
        // Filter already used letters by this
        for (let state of this.states) {
            available_letters.delete(state);
        }

        dfa.renameStates(available_letters);

        // Filter already used letters by dfa
        for (let state of dfa.states) {
            available_letters.delete(state);
        }

        // Add symbols from this to generate transition table
        for (let symbol of this.alphabet) {
            dfa.addSymbol(symbol);
        }

        // Mark added symbols to generate transition table
        let added_symbols = new Set();
        for (let symbol of dfa.alphabet) {
            if (!this.alphabet.has(symbol)) {
                this.addSymbol(symbol);
                added_symbols.add(symbol);
            }
        }
        for (let state of this.states) {
            dfa.addState(state);
            for (let symbol of this.alphabet) {
                dfa.transitions[state][symbol] = { to: new Set(), text: " -" };
                dfa.transitions[state][symbol].to = this.transitions[state][symbol].to;
                dfa.transitions[state][symbol].text = this.transitions[state][symbol].text;
            }
        }

        let selected_letter = [...available_letters][0];
        available_letters.delete(selected_letter);

        // Build initial
        dfa.addState(selected_letter);
        dfa.addSymbol("&");
        dfa.transitions[selected_letter]["&"].to = new Set([this.initial, dfa.initial]);
        dfa.transitions[selected_letter]["&"].text =
            " " + [...dfa.transitions[selected_letter]["&"].to].sort().join(",");
        dfa.setInitial(selected_letter);

        // Build final
        selected_letter = [...available_letters][0];
        available_letters.delete(selected_letter);

        dfa.addState(selected_letter);
        for (let final of this.finals) {
            dfa.transitions[final]["&"].to = new Set(selected_letter);
            dfa.transitions[final]["&"].text = " " + [...dfa.transitions[final]["&"].to].sort().join("");
        }
        for (let final of dfa.finals) {
            dfa.transitions[final]["&"].to = new Set(selected_letter);
            dfa.transitions[final]["&"].text = " " + [...dfa.transitions[final]["&"].to].sort().join("");
        }
        dfa.finals = new Set(selected_letter);

        // Clean this transition table
        for (let symbol of added_symbols) {
            this.deleteSymbol(symbol);
        }
        return dfa;
    }

    hasUndefinedTransition() {
        for (let state of this.states) {
            for (let symbol of this.alphabet) {
                if (!this.transitions[state][symbol].to.size) {
                    return true;
                }
            }
        }
        return false;
    }

    minimize() {
        let dfa = new FA();
        dfa.states = new Set(this.states);
        dfa.alphabet = new Set(this.alphabet);
        dfa.transitions = [];
        for (let state of this.states) {
            dfa.transitions[state] = [];
            for (let symbol of this.alphabet) {
                dfa.transitions[state][symbol] = { to: new Set(), text: " -" };
                dfa.transitions[state][symbol].to = this.transitions[state][symbol].to;
                dfa.transitions[state][symbol].text = this.transitions[state][symbol].text;
            }
        }
        dfa.initial = this.initial.slice(0);
        dfa.finals = new Set(this.finals);
        dfa.determinized = true;

        if (!dfa.determinized) {
            return;
        }
        let selected_letter;

        let available_letters = new Set();
        // Generate all aplhabet letters
        for (let i = 65; i < 91; i++) {
            available_letters.add(String.fromCharCode(i));
        }
        // Filter already used letters by this
        for (let state of dfa.states) {
            available_letters.delete(state);
        }
        // Build full transition automata
        if (dfa.hasUndefinedTransition()) {
            selected_letter = [...available_letters][0];
            dfa.addState(selected_letter);
            available_letters.delete(selected_letter);

            for (let state of dfa.states) {
                for (let symbol of dfa.alphabet) {
                    if (!dfa.transitions[state][symbol].to.size) {
                        dfa.transitions[state][symbol].to.add(selected_letter);
                        dfa.transitions[state][symbol].text = " " + selected_letter;
                    }
                }
            }
        }

        // Build relation table
        let relation_table = [];
        for (let state_1 of dfa.states) {
            relation_table[state_1] = [];
            for (let state_2 of dfa.states) {
                if (state_1 !== state_2) {
                    relation_table[state_1][state_2] = { marked: false, wait_list: new Set() };
                } else {
                    relation_table[state_1][state_2] = { marked: true, wait_list: new Set() };
                }
            }
        }

        // States trivially not equals
        for (let state_1 of dfa.states) {
            for (let state_2 of dfa.states) {
                if (dfa.finals.has(state_1) && !dfa.finals.has(state_2)) {
                    relation_table[state_1][state_2] = { marked: true, wait_list: new Set() };
                    relation_table[state_2][state_1] = { marked: true, wait_list: new Set() };
                }
            }
        }

        // Logic to mark not equal states. Reference: http://wwwp.fc.unesp.br/~simonedp/zipados/TC02.pdf
        for (let qu of dfa.states) {
            for (let qv of dfa.states) {
                if (relation_table[qu][qv].marked === false) {
                    for (let symbol of dfa.alphabet) {
                        let pu = [...dfa.transitions[qu][symbol].to][0];
                        let pv = [...dfa.transitions[qv][symbol].to][0];
                        if (pu === pv) {
                        } else if (pu !== pv && relation_table[pu][pv].marked === false) {
                            relation_table[pu][pv].wait_list.add(new Set([qu, qv]));
                            relation_table[pv][pu].wait_list.add(new Set([qu, qv]));
                        } else if (pu !== pv && relation_table[pu][pv].marked === true) {
                            relation_table[qu][qv].marked = true;
                            relation_table[qv][qu].marked = true;
                            let has_changed;
                            do {
                                has_changed = false;
                                for (let x of dfa.states) {
                                    for (let y of dfa.states) {
                                        if (relation_table[x][y].marked && relation_table[x][y].wait_list.size) {
                                            for (let element of relation_table[x][y].wait_list) {
                                                let e0 = [...element][0];
                                                let e1 = [...element][1];
                                                relation_table[e0][e1].marked = true;
                                                relation_table[e1][e0].marked = true;
                                            }
                                            relation_table[x][y].wait_list = new Set();
                                            relation_table[y][x].wait_list = new Set();
                                            has_changed = true;
                                        }
                                    }
                                }
                            } while (has_changed);
                        }
                    }
                }
            }
        }

        console.log(relation_table);

        if (selected_letter !== undefined) {
            dfa.deleteState(selected_letter);
            available_letters.add(selected_letter);
        }

        // Build the equals states
        let new_states = new Set();
        let equals_states = [];
        for (let x of dfa.states) {
            for (let y of dfa.states) {
                if (!relation_table[x][y].marked) {
                    let found = false;
                    for (let state of new_states) {
                        if (equals_states[state].has(x) || equals_states[state].has(y)) {
                            equals_states[state].add(x);
                            equals_states[state].add(y);
                            found = true;
                        }
                    }
                    if (!found) {
                        let new_state = [...available_letters][0];
                        available_letters.delete(new_state);
                        new_states.add(new_state);
                        equals_states[new_state] = new Set([x, y]);
                    }
                }
            }
        }

        console.log(equals_states);

        // Set transitions to new states
        for (let state of dfa.states) {
            for (let symbol of dfa.alphabet) {
                let to = [...dfa.transitions[state][symbol].to][0];
                for (let new_state of new_states) {
                    if (equals_states[new_state].has(to)) {
                        dfa.transitions[state][symbol].to = new Set(new_state);
                        dfa.transitions[state][symbol].text = " " + new_state;
                    }
                }
            }
        }

        // Add new states
        for (let new_state of new_states) {
            dfa.addState(new_state);
            for (let symbol of dfa.alphabet) {
                let set_to = new Set();
                for (let state of equals_states[new_state]) {
                    set_to.add([...dfa.transitions[state][symbol].to][0]);
                }
                let match_any_new = false;
                let selected_state = "";
                for (let each of set_to) {
                    for (let n of new_states) {
                        if (equals_states[n].has(each)) {
                            match_any_new = true;
                            selected_state = n;
                        }
                    }
                }
                if (match_any_new) {
                    dfa.transitions[new_state][symbol].to = new Set(selected_state);
                    dfa.transitions[new_state][symbol].text = " " + selected_state;
                } else {
                    dfa.transitions[new_state][symbol].to = new Set(set_to);
                    dfa.transitions[new_state][symbol].text = " " + set_to;
                }
            }
            for (let state of equals_states[new_state]) {
                if (dfa.initial === state) {
                    dfa.initial = new_state;
                }
                if (dfa.finals.has(state)) {
                    dfa.finals.delete(state);
                    dfa.finals.add(new_state);
                }
                dfa.deleteState(state);
            }
        }
        return dfa;
    }
}
