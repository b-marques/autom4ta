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
        for (let head in grammar.P) {
            grammar.P[head].forEach(element => {
                if (element.length === 1) {
                    transitions.push({
                        from: head,
                        to: ACCEPT_STATE,
                        when: element
                    });
                } else {
                    transitions.push({
                        from: head,
                        to: element.charAt(1),
                        when: element.charAt(0)
                    });
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
        return this.transitions.some(transition => {
            for (let t in this.transitions) {
                if (
                    transition.from === this.transitions[t].from &&
                    transition.to !== this.transitions[t].to &&
                    transition.when === this.transitions[t].when
                ) {
                    return false;
                }
            }
            return true;
        });
    }

    addState(state) {
        this.states.add(state);
    }

    addSymbol(symbol) {
        this.alphabet.add(symbol);
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
    updateTransition(from, to, when) {
        to = to.replace(/[ \-\t\r]+/g, "");
        to = to.toUpperCase();
        to = to.split(",");
        to = new Set(to.filter(element => element !== ""));
        console.log(to);

        this.transitions = this.transitions.filter(
            transition => transition.from !== from || transition.when !== [...this.alphabet][when]
        );

        to.forEach(state => {
            if (state === "") {
                return;
            }
            if (!this.states.has(state)) {
                this.states.add(state);
                this.transitions.push({ from: from, to: state, when: [...this.alphabet][when] });
            } else {
                this.transitions.push({ from: from, to: state, when: [...this.alphabet][when] });
            }
        });
        console.log(this.transitions);
    }
}
