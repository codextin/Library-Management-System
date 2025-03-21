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

    // find the last id number
    let uniqueId = dataArray.length > 0 ? Math.max(...dataArray.map(item => item.id)) + 1 : 0;
    
    // Create a new book object
    const dataObject = {
        title,
        author,
        isbn,
        status,
        id: uniqueId++,
    };

    console.log(dataObject);
    console.log(dataArray.length);


    // Check if the ISBN already exists in the data
    const checkISBN = dataArray.findIndex(book => book.isbn === isbn);
    if (checkISBN !== -1) {
        Swal.fire({
            icon: 'error',
            title: 'ISBN already exists',
            text: 'Please enter a unique ISBN.'
        });
        return;
    } else {

        dataArray.push(dataObject);

        // Store updated data in local storage
        storeData(dataArray);

        // Clear form inputs
        form.reset();

        // Close the add book modal after adding a book
        $('#addBookModal').modal('hide');

        // Update table with new book data
        updateTable();

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });

        Toast.fire({
            icon: 'success',
            title: 'Book added successfully'
        });
    }
});

function updateTable() {
    const tableBody = document.getElementById('book-table-body');
    tableBody.innerHTML = '';
    const reversed = dataArray.reverse();
    reversed.forEach(({ title, author, isbn, status, id }, index) => {
        tableBody.innerHTML += `
        <tr>
            <td class="col-4 text-break"><div class="mt-1">${title}</div></td>
            <td class="col-2"><div class="mt-1">${author}</div></td>
            <td class="col-2"><div class="mt-1">${isbn}</div></td>
            <td class="col-2">
                <div class="mt-2">
                    <span class="badge ${status === "Available" ? "badge-success" : "badge-danger"}">${status}</span>
                </div>
            </td>
            <td class="col-2">
                <div class="d-flex">
                    <button class="btn btn-outline-primary btn-sm mr-2 d-flex align-items-center" title="Update" onclick="updateModal(${id})">
                        <i class="fas fa-edit"></i>
                        <span class="d-none d-sm-block pl-1">Edit</span>
                    </button>
                    <button class="btn btn-outline-danger btn-sm d-flex align-items-center" title="Delete" onclick="deleteRow(${id})">
                        <i class="fas fa-trash-alt"></i>
                        <span class="d-none d-sm-block pl-1">Delete</span>
                    </button>
                </div>
            </td>
        </tr>
        `;
    })
}

updateTable(); // always call the update function

function deleteRow(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            const index = dataArray.findIndex(book => book.id === id);
            if (index > -1) {
                dataArray.splice(index, 1);
                storeData(dataArray);
                updateTable();
            }
            // Swal.fire({
            //     title: "Deleted!",
            //     text: "Your file has been deleted.",
            //     icon: "success"
            // });

            const Toast = Swal.mixin({
                toast: true,
                top: 10,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });

            Toast.fire({
                icon: 'success',
                title: 'Book deleted successfully'
            });
        }
    });
}

function updateModal(id2) {
    $('#updateBookModal').modal('show');

    const { title, author, isbn, status, id } = dataArray.find(book => book.id === id2);

    const form = document.getElementById('update-book-form');
    form.innerHTML = '';
    form.innerHTML = `
    <div class="form-group">
        <label for="updateBookTitle">Book Title</label>
        <input type="text" class="form-control" id="updateBookTitle" name="title" placeholder="Enter book title" value="${title}" required>
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
            <option value="Unavailable" ${status == "Unavailable" ? "selected" : ""}>Unavailable</option>
        </select>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" onclick="updateRow(${id})">Update Book</button>
    </div>
    `;
}

function updateRow(id) {
    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
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
            $('#updateBookModal').modal('hide');

            // Update table with new data
            updateTable();
            Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");

            // Close the update book modal
            $('#updateBookModal').modal('hide');
        }
    });
}

document.getElementById("sortOption").addEventListener("change", function () {
    const sortOption = this.value;
    if (sortOption === "title") {
        dataArray.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === "author") {
        dataArray.sort((a, b) => b.author.localeCompare(a.author));
    } else if (sortOption === "isbn") {
        dataArray.sort((a, b) => b.isbn - a.isbn);
    } else if (sortOption === "status") {
        dataArray.sort((a, b) => b.status.localeCompare(a.status));
    }
    updateTable();
})
