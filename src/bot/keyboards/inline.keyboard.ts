import { Markup } from 'telegraf';

interface IButton {
  text: string;
  callback_data: string;
}

export interface IKeyboardItem {
  text: string | number;
  callbackData: string | number;
}

interface InlineKeyboardProps {
  data: string[] | number[] | IKeyboardItem[];
  row?: number;
  textPrefix?: string;
  callbackDataPrefix?: string;
}

export const inlineKeyboard = ({
  data,
  textPrefix,
  callbackDataPrefix,
  row = 3,
}: InlineKeyboardProps) => {
  const buttons: IButton[][] = [];
  for (let i = 0; i < data.length; i++) {
    const currentColumn = Math.floor(i / row);
    if (!Array.isArray(buttons[currentColumn])) {
      buttons[currentColumn] = [];
    }
    const currentRow = i % row;
    buttons[currentColumn][currentRow] = {
      text: `${textPrefix || ''}${(data[i] as IKeyboardItem).text || data[i]}`,
      callback_data: `${callbackDataPrefix || ''}${
        (data[i] as IKeyboardItem).callbackData || data[i]
      }`,
    };
  }
  return Markup.inlineKeyboard(buttons).reply_markup;
};
