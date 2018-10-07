const ACCEPT_STATE = "☢";

export default class FA {
    constructor(states, alphabet, transitions, initial, finals) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitions = transitions;
        this.initial = initial;
        this.finals = finals;
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
                    alert(
                        "Should not have epsilon transitions in other productions than the initial"
                    );
                    this.reset();
                    return this;
                }
            }
        }

        // Prevent productions to a production with epsilon
        if (epsilonAtInitial) {
            for (let head in grammar.P) {
                grammar.P[head].forEach(element => {
                    if (
                        element.length === 2 &&
                        element.charAt(1) === grammar.S
                    ) {
                        alert(
                            "Should not have a transition to the intial state having epsilon"
                        );
                        this.reset();
                        return this;
                    }
                });
            }
        }
        let states = [...grammar.Vn, ACCEPT_STATE];
        let alphabet = [...grammar.Vt];
        let transitions = [];
        let initial = grammar.S;
        let finals = epsilonAtInitial
            ? [...grammar.S, ACCEPT_STATE]
            : [ACCEPT_STATE];

        // Prevent productions to a production with epsilon
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
        console.log(this);
    }

    reset() {
        this.states = [];
        this.alphabet = [];
        this.transitions = [];
        this.initial = null;
        this.finals = [];
    }
}
