import XRegExp from "xregexp";

const line_regex = XRegExp(
    [
        "^(?<head>\\s*([A-Z])\\s*)->(?<body>\\s*",
        "(",
        "((&\\s*)|(([a-z]|[0-9])([A-Z])\\s*)|(([a-z]|[0-9])\\s*))",
        "((\\|\\s*&\\s*)|(\\|\\s*(([a-z]|[0-9])([A-Z])\\s*)|(\\|\\s*([a-z]|[0-9])\\s*)))*",
        "\\s*))$"
    ].join("")
);

export default class Grammar {
    constructor(text = "", Vt, Vn, P, S, valid = false) {
        this.text = text;
        this.Vt = Vt;
        this.Vn = Vn;
        this.P = P;
        this.S = S;
        this.valid = valid;
    }

    extractElements() {
        this.reset();

        // Remove new line whit null behind
        let lines = this.text.replace(/(?<!([a-z]|&|[0-9]|[A-Z]))\n/g, "");

        // Remove new line whit null ahead
        lines = lines.replace(/\n(?!([a-z]|&|[0-9]|[A-Z]))/g, "");

        // Split input in multiple lines
        lines = lines.split("\n");

        for (let i = 0; i < lines.length; i++) {
            // Check if is a valid line with regex
            const first_check = XRegExp.exec(lines[i], line_regex);
            if (first_check === null) {
                this.reset();
                return this;
            }
            // If valid, remove spaces from input
            lines[i] = lines[i].replace(/[ \t\r]+/g, "");
            const production = XRegExp.exec(lines[i], line_regex);

            if (i === 0) this.S = production.head;

            // Extracting production rules
            production.body.split("|").forEach(element => {
                if (this.P[production.head] === undefined) this.P[production.head] = new Set();
                this.P[production.head].add(element);
            });
        }
        this.Vt = this.extractTerminals(this.P);
        this.Vn = this.extractNonTerminals(this.P);
        this.valid = true;
        return this;
    }

    extractTerminals(rules) {
        let terminals = new Set();
        for (let head in rules)
            rules[head].forEach(element => {
                terminals.add(element.charAt(0));
            });
        return terminals;
    }
    extractNonTerminals(rules) {
        let non_terminals = new Set();
        for (let head in rules) {
            non_terminals.add(head);
            rules[head].forEach(element => {
                if (element.length > 1) non_terminals.add(element.charAt(1));
            });
        }
        return non_terminals;
    }

    reset() {
        this.Vt = new Set();
        this.Vn = new Set();
        this.P = {};
        this.S = null;
        this.valid = false;
    }

    buildFromDFA(dfa) {
        this.reset();
        this.Vt = new Set(dfa.alphabet);
        this.Vn = new Set(dfa.states);
        this.valid = true;
        this.S = dfa.initial;

        // Remove accept states whitout transitions from Vn to build the grammar
        let Vn_filtered = new Set(this.Vn);
        for (let state of Vn_filtered) {
            if (dfa.finals.has(state)) {
                let counter = 0;
                for (let symbol of this.Vt) {
                    counter += dfa.transitions[state][symbol].to.size;
                }
                if (!counter) Vn_filtered.delete(state);
            }
        }

        this.P[this.S] = new Set();
        for (let symbol of this.Vt) {
            let to = dfa.transitions[this.S][symbol].text.slice(1);
            if (dfa.transitions[this.S][symbol].to.size > 0) {
                if (dfa.finals.has(to)) {
                    this.P[this.S].add(symbol);
                    if (Vn_filtered.has(to)) {
                        this.P[this.S].add(symbol + to);
                    }
                } else {
                    this.P[this.S].add(symbol + to);
                }
            }
        }

        this.text = this.S + " -> " + [...this.P[this.S]].join(" | ") + "\n";

        let Vn_whitout_S = new Set(Vn_filtered);
        Vn_whitout_S.delete(this.S);
        for (let Vn of Vn_whitout_S) {
            this.P[Vn] = new Set();
            for (let symbol of this.Vt) {
                // remove space from beggining of text
                let to = dfa.transitions[Vn][symbol].text.slice(1);
                if (dfa.transitions[Vn][symbol].to.size > 0) {
                    if (dfa.finals.has(to)) {
                        this.P[Vn].add(symbol);
                        if (Vn_filtered.has(to)) {
                            this.P[Vn].add(symbol + to);
                        }
                    } else {
                        this.P[Vn].add(symbol + to);
                    }
                }
            }
            if (this.P[Vn].size) {
                this.text += Vn + " -> " + [...this.P[Vn]].join(" | ") + "\n";
            }
        }
        this.text = this.text.slice(0, -1);
    }

    toJSON() {
        return {
            text: this.text,
            Vt: [...this.Vt],
            Vn: [...this.Vn],
            P: this.P,
            S: this.S,
            valid: this.valid
        };
    }
}
