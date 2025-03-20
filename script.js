function storeData(data) {
    localStorage.setItem('data', JSON.stringify(data));
    // console.log('Data stored');
}

function getData() {
    try {
        return JSON.parse(localStorage.getItem('data')) || [];
    } catch (error) {
        console.error('Error parsing data:', error);
        return [];
    }
}

let dataArray = [...getData()];

// Update the form submission logic to close the modal after adding a book
document.getElementById("add-book-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = document.getElementById("add-book-form");
    const formData = new FormData(form);

    // Destructure values directly from FormData
    const { title, author, isbn, status } = Object.fromEntries(formData);

    // console.log(title, author, isbn, status);

    // console.log(dataArray[dataArray.length - 1])
    // Create a new book object
    const dataObject = {
        title,
        author,
        isbn,
        status,
        id: dataArray.length === 0 ? dataArray.length + 1 : dataArray[dataArray.length - 1].id + 1,
    };
    dataArray.push(dataObject);

    // Store updated data in local storage
    storeData(dataArray);

    // Clear form inputs
    form.reset();

    // Close the add book modal after adding a book
    $('#addBookModal').modal('hide');

    // Update table with new book data
    updateTable();
});

function updateTable() {
    const tableBody = document.getElementById('book-table-body');
    tableBody.innerHTML = '';
    // console.log(getData());
    const reversed = dataArray.reverse(); // need to reverse to display the latest data
    // console.log(reversed);
    reversed.forEach(({ title, author, isbn, status, id }, index) => {
        tableBody.innerHTML += `
        <tr>
            <td>${title}</td>
            <td>${author}</td>
            <td>${isbn}</td>
            <td><span class="badge ${status === "Available" ? "badge-success" : "badge-danger"}">${status}</span></td>
            <td>
                <button class="btn btn-outline-primary btn-sm mr-2" title="Update" onclick="updateModal(${id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" title="Delete" onclick="deleteRow(${id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
        `;
    })
}

updateTable(); // always call the update function

function deleteRow(id) {
    if (confirm('Are you sure you want to delete this row?')) {
        const index = dataArray.findIndex(book => book.id === id);
        if (index > -1) {
            dataArray.splice(index, 1);
            storeData(dataArray);
            updateTable();
        }
    }
}

function updateModal(id2) {
    $('#updateBookModal').modal('show');

    const { title, author, isbn, status, id } = dataArray.find(book => book.id === id2);

    const form = document.getElementById('update-book-form');
    form.innerHTML = '';
    form.innerHTML = `
    <div class="form-group">
        <label for="updateBookTitle">Book Title</label>
        <input type="text" class="form-control" id="updateBookTitle" name="title" placeholder="Enter book title" value="${title}"
            required>
    </div>
    <div class="form-group">
        <label for="updateBookAuthor">Author</label>
        <input type="text" class="form-control" id="updateBookAuthor"
            placeholder="Enter author name" name="author" value="${author}" required>
    </div>
    <div class="form-group">
        <label for="updateISBN">ISBN</label>
        <input type="number" class="form-control" id="updateISBN" placeholder="ISBN #" name="isbn" value="${isbn}" required>
    </div>
    <div class="form-group">
        <label for="updateBookStatus">Status</label>
        <select class="form-control" id="updateBookStatus" name="status" required>
            <option value="Available" ${status == "Available" ? "selected" : ""}>Available</option>
            <option value="Unvailable" ${status == "Unvailable" ? "selected" : ""}>Unvailable</option>
        </select>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary" onclick="updateRow(${id})">Update Book</button>
    </div>
    `;
}

function updateRow(id) {
    const form = document.getElementById('update-book-form');
    const formData = new FormData(form);

    // Convert FormData to an object and destructure values
    const { title, author, isbn, status } = Object.fromEntries(formData);

    // Find index of the item to update
    const index = dataArray.findIndex(book => book.id === id);
    console.log(index);

    if (index !== -1) {
        dataArray.splice(index, 1, { title, author, isbn, status, id }); // Remove 1 item at index and replace it
    } else {
        console.warn(`Book with id ${id} not found`);
    }
    const reversed = dataArray.reverse(); // need to reverse to display the latest data


    // Store updated data in localStorage
    storeData(reversed); // need to reversed back to make no changes on position in update
    // storeData(dataArray);

    // Clear form inputs
    form.reset();

    // Close the update book modal
    $('#addBookModal').modal('hide');

    // Update table with new data
    updateTable();
}
