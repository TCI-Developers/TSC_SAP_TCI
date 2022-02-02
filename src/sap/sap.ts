require('dotenv').config();

export const abapSystem = {
    user    : String(process.env.TCI_SAP_USER),
    passwd  : String(process.env.TCI_SAP_PASS),
    ashost  : String(process.env.TCI_SAP_ASHOST),
    sysnr   : String(process.env.TCI_SAP_SYSNR),
    client  : String(process.env.TCI_SAP_CLIENT),
    lang    : String(process.env.TCI_SAP_LANG),
};

export const abapSystemTest = {
    user    : String(process.env.TCI_SAP_USER_TEST),
    passwd  : String(process.env.TCI_SAP_PASS_TEST),
    ashost  : String(process.env.TCI_SAP_ASHOST_TEST),
    sysnr   : String(process.env.TCI_SAP_SYSNR_TEST),
    client  : String(process.env.TCI_SAP_CLIENT_TEST),
    lang    : String(process.env.TCI_SAP_LANG_TEST),
};