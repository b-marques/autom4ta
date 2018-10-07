import * as actionType from "./ActionType";

export const addLanguage = name => ({
    type: actionType.ADD_LANGUAGE,
    name: name
});

export const selectLanguage = id => ({
    type: actionType.SELECT_LANGUAGE,
    selected_id: id
});

export const removeLanguage = () => ({
    type: actionType.REMOVE_LANGUAGE
});

export const updateGrammar = text => ({
    type: actionType.UPDATE_GRAMMAR,
    text: text
});
