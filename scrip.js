function buildLoanRows(data) {
  const books = data.books;
  const readers = data.readers;
  const loans = data.loans;

  function toRow(loan) {
    const loanId = loan.id;
    const bookId = loan.bookId;
    const readerId = loan.readerId;
    const elapsedDays = loan.elapsedDays;
    const returned = loan.returned;

    const book = books.find(function (b) {
      return b.id === bookId;
    });
    const bookTitle = book ? book.title : undefined;
    const loanDays = book ? book.policy.loanDays : undefined;

    const reader = readers.find(function (r) {
      return r.id === readerId;
    });

    let readerLabel = "ناشناس عضو ";
    if (reader && reader.profile && reader.profile.displayName) {
      readerLabel = reader.profile.displayName;
    }

    const email = reader?.contact?.email;
    let emailLabel = "نشده ثبت ایمیل ";
    if (email) {
      emailLabel = email;
    }

    let status = "on-time";
    let remainingDays = loanDays - elapsedDays;
    let overdueDays = 0;

    if (returned) {
      status = "returned";
      remainingDays = 0;
      overdueDays = 0;
    }

    if (!returned && elapsedDays > loanDays) {
      status = "overdue";
      remainingDays = 0;
      overdueDays = elapsedDays - loanDays;
    }

    return {
      loanId: loanId,
      bookTitle: bookTitle,
      readerLabel: readerLabel,
      emailLabel: emailLabel,
      status: status,
      remainingDays: remainingDays,
      overdueDays: overdueDays,
    };
  }

  return loans.map(toRow);
}
/////////////////////////////////2/////////////////////////////

function buildLibraryReport(data) {
  const books = data.books;
  const readers = data.readers;
  const loans = data.loans;

  const rows = buildLoanRows(data);

  const activeRows = rows.filter(function (row) {
    return row.status !== "returned";
  });

  const overdueRows = activeRows.filter(function (row) {
    return row.status === "overdue";
  });

  const loanCount = loans.length;
  const activeCount = activeRows.length;
  const overdueCount = overdueRows.length;

  let totalOverdueDays = 0;
  for (let i = 0; i < overdueRows.length; i++) {
    totalOverdueDays = totalOverdueDays + overdueRows[i].overdueDays;
  }

  let unmatchedReaderLoanCount = 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].readerLabel === "ناشناس عضو ") {
      unmatchedReaderLoanCount = unmatchedReaderLoanCount + 1;
    }
  }

  let mostOverdueLoanId = null;
  let maxOverdueDays = 0;
  for (let i = 0; i < overdueRows.length; i++) {
    if (overdueRows[i].overdueDays > maxOverdueDays) {
      maxOverdueDays = overdueRows[i].overdueDays;
      mostOverdueLoanId = overdueRows[i].loanId;
    }
  }

  const byReader = [];
  for (let i = 0; i < readers.length; i++) {
    const reader = readers[i];
    const readerId = reader.id;
    const readerLabel = reader.profile.displayName;

    const readerActiveRows = activeRows.filter(function (row) {
      const loan = loans.find(function (l) {
        return l.id === row.loanId;
      });
      return loan && loan.readerId === readerId;
    });

    const readerOverdueRows = overdueRows.filter(function (row) {
      const loan = loans.find(function (l) {
        return l.id === row.loanId;
      });
      return loan && loan.readerId === readerId;
    });

    let readerTotalOverdueDays = 0;
    for (let j = 0; j < readerOverdueRows.length; j++) {
      readerTotalOverdueDays = readerTotalOverdueDays + readerOverdueRows[j].overdueDays;
    }

    byReader.push({
      readerId: readerId,
      readerLabel: readerLabel,
      activeCount: readerActiveRows.length,
      overdueCount: readerOverdueRows.length,
      totalOverdueDays: readerTotalOverdueDays,
    });
  }

  return {
    loanCount: loanCount,
    activeCount: activeCount,
    overdueCount: overdueCount,
    totalOverdueDays: totalOverdueDays,
    unmatchedReaderLoanCount: unmatchedReaderLoanCount,
    mostOverdueLoanId: mostOverdueLoanId,
    byReader: byReader,
  };
}

///////////////////3//////////////////////////////
function prepareReminderRequest(data, loanId) {
    const loans = data.loans || [];
    const readers = data.readers || [];

    const loan = loans.find(function(item) {
        return item.id === loanId;
    });

    if (!loan) {
        return null;
    }

    if (loan.returned === true) {
        return null;
    }

    let isOverdue = loan.elapsedDays > loan.loanDays;
    if (!isOverdue) {
        return null;
    }

    const reader = readers.find(function(item) {
        return item.id === loan.readerId;
    });

    if (!reader) {
        return null;
    }

    if (!reader.contact || !reader.contact.email || reader.contact.email === "") {
        return null;
    }

    const newReminder = {
        requested: true,
        note: loan.reminder?.note
    };

    const newLoan = {
        ...loan,
        reminder: newReminder
    };

    return newLoan;
}