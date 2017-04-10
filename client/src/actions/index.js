export const addStock = stock => ({
  type: 'ADD_STOCK',
  stockID: stock.stockID,
  data: stock.data,
  color: stock.color,
  name: stock.name,
});

export const removeStock = index => ({
  type: 'REMOVE_STOCK',
  index,
});

export const setDialogText = dialogText => ({
  type: 'SET_DIALOG_TEXT',
  dialogText,
});

export const showDialog = () => ({ type: 'SHOW_DIALOG' });

export const hideDialog = () => ({ type: 'HIDE_DIALOG' });
