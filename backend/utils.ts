export function validateEmail(inputField: string): boolean {
    const isValid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(inputField);
    return isValid;
};


export function validateWebURL(inputField: string): boolean {
    const isValid = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(inputField);
    return isValid;
};

export function compare( a, b ) {
    if ( a.wordsAmount > b.wordsAmount ){
      return -1;
    }
    if ( a.wordsAmount < b.wordsAmount ){
      return 1;
    }
    return 0;
};

