// The only file you need to edit for donations.
// Ko-fi: change the URL if your page is not ko-fi.com/fiiyou.
// Bank transfer: the IBAN is checked (mod 97) before it is shown, so a typo means the block stays hidden
// instead of sending someone's money to the wrong place.
window.FIIYOU = {
  kofi: 'https://ko-fi.com/fiiyou',
  bank: {
    holder: '',          // name on the account. Add it so people can fill in the beneficiary field, e.g. 'Your Name'
    iban: 'RO24 RNCB 0034 1746 7991 0001',
    bic: '',             // optional, only needed for transfers from outside the EU
    reference: 'fiiyou', // what people should write in the transfer details
  },
};
