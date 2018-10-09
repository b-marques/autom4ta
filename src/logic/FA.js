const ACCEPT_STATE = "☢";

export default class FA {
    constructor(states, alphabet, transitions, initial, finals) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitions = transitions;
        this.initial = initial;
        this.finals = finals;
    }

    reset() {
        this.states = new Set();
        this.alphabet = new Set();
        this.transitions = [];
        this.initial = "";
        this.finals = new Set();
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
        for (let state in [...states]) {
            transitions[[...states][state]] = [];
            for (let symbol in [...alphabet]) {
                transitions[[...states][state]][[...alphabet][symbol]] = { to: new Set(), text: " -" };
            }
        }
        for (let head in grammar.P) {
            grammar.P[head].forEach(element => {
                if (element.length === 1) {
                    transitions[head][element].to.add(ACCEPT_STATE);
                    transitions[head][element].text = " " + [...transitions[head][element].to].join(", ");
                } else {
                    transitions[head][element.charAt(0)].to.add(element.charAt(1));
                    transitions[head][element.charAt(0)].text =
                        " " + [...transitions[head][element.charAt(0)].to].join(", ");
                }
            });
        }
        this.states = states;
        this.alphabet = alphabet;
        this.transitions = transitions;
        this.initial = initial;
        this.finals = finals;
    }

    isDeterminisc() {
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
        if (this.states.has(state)) {
            return;
        }
        this.states.add(state);
        // Update transition array
        let alphabet = [...this.alphabet];
        this.transitions[state] = [];
        for (let symbol in alphabet) {
            this.transitions[state][alphabet[symbol]] = { to: new Set(), text: " -" };
        }
    }

    addSymbol(symbol) {
        if (this.alphabet.has(symbol)) {
            return;
        }
        this.alphabet.add(symbol);
        // Update transition array
        let states = [...this.states];
        for (let s in states) {
            this.transitions[states[s]][symbol] = { to: new Set(), text: " -" };
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

        value = value.replace(/[ -]+/g, "");
        value = value.split(",");
        value = new Set(value.filter(element => element !== ""));

        [...value].forEach(element => {
            this.addState(element);
        });

        this.transitions[state][symbol].to = value;
        this.transitions[state][symbol].text = value.size ? " " + [...value].join(", ") : " -";
    }

    hasInitial() {
        if (this.initial) return true;
        return false;
    }

    determinize() {
        let dfa = new FA();
        dfa.reset();
        [...this.alphabet].forEach(symbol => {
            dfa.addSymbol(symbol);
        });
        dfa.addState(this.initial);
        dfa.initial = this.initial;

        let old_length;
        do {
            old_length = dfa.states.size;
            // Build transitions
            let states = [...dfa.states];
            let alphabet = [...dfa.alphabet];
            for (let state of states) {
                for (let symbol of alphabet) {
                    // Build reachable states from actual
                    let composedDestiny = new Set();
                    // Split composed states and for each composed their "tos"
                    for (let element of state.split("")) {
                        let tos = [...this.transitions[element][symbol].to];
                        for (let to in tos) {
                            composedDestiny.add(tos[to]);
                        }
                    }

                    if (composedDestiny.size) {
                        let composedState = [...composedDestiny].join("");
                        dfa.addState(composedState);
                        dfa.transitions[composedState][symbol].to = composedDestiny;
                        [...composedDestiny].forEach(element => {
                            if (this.finals.has(element)) {
                                dfa.finals.add(composedState);
                            }
                        });
                    }
                }
            }
        } while (old_length !== dfa.states.size);
        console.log(dfa);
    }
}
