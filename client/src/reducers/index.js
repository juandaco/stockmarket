import { combineReducers } from 'redux';

function stocks(state = [], action) {
  switch (action.type) {
    case 'ADD_STOCK':
      return [
        ...state,
        {
          stockID: action.stockID,
          data: action.data,
          color: action.color,
          name: action.name,
        },
      ];
    case 'REMOVE_STOCK':
      return state.filter((stock, index) => index !== action.index);
    default:
      return state;
  }
}

function dialogText(state = '', action) {
  if (action.type === 'SET_DIALOG_TEXT') {
    return action.dialogText;
  } else {
    return state;
  }
}

function showDialog(state = false, action) {
  if (action.type === 'SHOW_DIALOG') {
    return true;
  } else if (action.type === 'HIDE_DIALOG') {
    return false;
  }
  return false;
}

const stockMarketApp = combineReducers({
  stocks,
  dialogText,
  showDialog,
});

export default stockMarketApp;
