export const initial_shape = {
    languageReducer: {
        selected_language: 0,
        languages: [
            {
                name: "aa",
                grammar: { Vn: "", Vt: "", S: "", P: "", text: "" },
                fa: {
                    states: [],
                    alphabet: [],
                    transitions: [],
                    initial: "",
                    finals: []
                },
                er: "......"
            },
            {
                name: "bb",
                grammar: {
                    Vn: "",
                    Vt: "",
                    S: "",
                    P: "",
                    text: "S -> cC | c" + String.fromCharCode(9763)
                },
                fa: {
                    states: [],
                    alphabet: [],
                    transitions: [],
                    initial: "",
                    finals: []
                },
                er: "......"
            },
            {
                name: "cc",
                grammar: { Vn: "", Vt: "", S: "", P: "", text: "" },
                fa: {
                    states: [],
                    alphabet: [],
                    transitions: [],
                    initial: "",
                    finals: []
                },
                er: "......"
            }
        ]
    }
};
