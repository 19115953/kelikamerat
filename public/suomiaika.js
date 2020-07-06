function suomiAika(aika) {
    let aikaStr = aika.getDate() + '.' + (aika.getMonth() + 1) + '.' + aika.getFullYear() + ' ';
    aikaStr += aika.getHours() + '.';
    if (aika.getMinutes() < 10) {
        aikaStr += '0' + aika.getMinutes();
    } else {
        aikaStr += aika.getMinutes();
    }
    aikaStr += '.';
    if (aika.getSeconds() < 10) {
        aikaStr += '0' + aika.getSeconds();
    } else {
        aikaStr += aika.getSeconds();
    }
    return aikaStr;
}