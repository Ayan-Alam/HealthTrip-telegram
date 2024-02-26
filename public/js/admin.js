function showTableContent(){
    const tableContainer = document.getElementById('userTableContainer');
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    const nameHeader = headerRow.insertCell(0);
    const deleteHeader = headerRow.insertCell(1);
    nameHeader.innerHTML = '<b>Name</b>';
    deleteHeader.innerHTML = '<b>Action</b>';
    axios.get("http://localhost:3000/users").then((res)=>{
        res.data.users.forEach((user,index) => {
            const row = table.insertRow();
                const nameCell = row.insertCell(0);
                const deleteCell = row.insertCell(1);
                nameCell.innerHTML = user.name;
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.innerText = 'Delete';
                deleteButton.addEventListener('click', () => deleteUser(index,user.telegramId));
                deleteCell.appendChild(deleteButton);
        });
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    })
    function deleteUser(index,userID) {
        axios.delete(`http://localhost:3000/users/${userID}`)
        showTableContent();
    }
}
document.addEventListener("DOMContentLoaded", showTableContent);