const someVar = 10;

function aFunction() {
    const anotherVariable = someVar + 10;
    if (anotherVariable === someVar) {
        return true;
    }
}

aFunction();
