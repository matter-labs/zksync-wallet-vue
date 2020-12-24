import walletData from "@/plugins/walletData.js";

function customExpHandle(x) {
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10,e-1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
            e -= 20;
            x /= Math.pow(10,e);
            x += (new Array(e+1)).join('0');
        }
    }
    return x;
}
const handleExpNum = (symbol, amount) => {
    if(!amount){return "0"}
    if(typeof(amount) === "number") {
        amount = customExpHandle(amount);
    }
    const syncProvider = walletData.get().syncProvider;
    return handleFormatToken(symbol, syncProvider.tokenSet.parseToken(symbol, amount.toString()).toString());
}
const handleFormatToken = (symbol, amount) => {
    if (!amount) return "0";
    if (typeof amount === "number") {
        amount = amount.toString();
    }
    const syncProvider = walletData.get().syncProvider;
    return syncProvider.tokenSet.formatToken(symbol, amount);
};
const getFormatedTotalPrice = (price, amount) => {
    const total = price * amount;
    if(!amount || total===0){return "$0.00"}
    if(total<0.01) {
        return `<$0.01`
    }
    else {
        return `~$${customExpHandle(total).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]}`
    }
}
export default {
    handleExpNum,
    handleFormatToken,
    getFormatedTotalPrice
}