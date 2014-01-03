


function pnpoly(xp, yp, x, y) {
    var i, j, c = 0, npol = xp.length;

    for (i = 0, j = npol-1; i < npol; j = i++) {
        if ((((yp[i] <= y) && (y < yp[j])) || ((yp[j] <= y) && (y < yp[i]))) &&
        (x < (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i])) {
            c =!c;
        }
    }
    return c;
}