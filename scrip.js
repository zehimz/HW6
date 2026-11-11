function buildLoanRows(data) {
    const loans = data.loans || [];
    const books = data.books || [];
    const readers = data.readers || [];

    function createRow(loan) {
        const { bookId, readerId, returned, elapsedDays, loanDays } = loan;

        const book = books.find(function(item) {
            return item.id === bookId;
        });

        const reader = readers.find(function(item) {
            return item.id === readerId;
        });
        
// const newArr = data.loans.map(buildLoanRows)

        let status = "";
        let remainingDays = 0;
        let overdueDays = 0;

        if (returned === true) {
            status = "returned";
        } else if (elapsedDays <= loanDays) {
            status = "on-time";
            remainingDays = loanDays - elapsedDays;
        } else {
            status = "overdue";
            overdueDays = elapsedDays - loanDays;
        }
        // const bookTitle = data.books.find(findBookId)
// const readerLabel = data.readers.find(findReaderLabel)

        return {
            loanId: loan.id,
            bookTitle: book ? book.title : "",
            readerLabel: reader?.displayName ? reader.displayName : "readership name, or ",
            emailLabel: reader?.contact?.email ? reader.contact.email : "email id",
            status: status,
            remainingDays: remainingDays,
            overdueDays: overdueDays
        };
    }

    return loans.map(createRow);
}