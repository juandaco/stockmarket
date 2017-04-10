function stocks(state = [], action) {
  switch (action.type) {
    case 'ADD_STOCK':
      return state.concat([
        {
          stockID: action.stockID,
          data: action.data,
          color: action.color,
          name: action.name,
        },
      ]);
    case 'REMOVE_STOCK':
      return state.filter((stock, index) => index !== action.index);
    default:
      return state;
  }
}

function dialogText(state = '', action) {
  if (action.type === 'SET_DIALOG_TEXT') {
    return action.text;
  } else {
    return state;
  }
}

function dialogShow(state = false, action) {
  if (action.type === 'SHOW_DIALOG') {
    return true;
  } else if (action.type === 'HIDE_DIALOG') {
    return false;
  }
  return false;
}

function stockMarketApp(state = {}, action) {
  return {
    stocks: stocks(state.stocks, action),
    text: dialogText(state.text, action),
    showDialog: dialogShow(state.showDialog, action),
  };
}

export default stockMarketApp;
