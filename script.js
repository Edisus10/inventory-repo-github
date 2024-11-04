      // Inisialisasi saat halaman dimuat
      document.addEventListener('DOMContentLoaded', function() {
        loadDataFromStorage();
        document.getElementById('date').valueAsDate = new Date();
    });

    // Fungsi untuk menyimpan data ke localStorage
    function saveToStorage() {
        let tableBody = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
        let data = [];

        for (let i = 0; i < tableBody.rows.length; i++) {
            let row = tableBody.rows[i];
            data.push({
                jenisBarang: row.cells[1].innerText,
                harga: row.cells[4].innerText
            });
        }

        localStorage.setItem('inventoryData', JSON.stringify(data));
    }

    // Fungsi untuk memuat data dari localStorage
    function loadDataFromStorage() {
        let data = localStorage.getItem('inventoryData');
        if (data) {
            data = JSON.parse(data);
            let tableBody = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
            tableBody.innerHTML = '';

            data.forEach((item, index) => {
                let newRow = tableBody.insertRow();
                newRow.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.jenisBarang}</td>
                    <td>0</td>
                    <td>0</td>
                    <td>${item.harga}</td>
                    <td>0</td>
                    <td class="non-printable">
                        <button class="edit-btn" onclick="editRow(this)">Edit</button>
                        <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
                    </td>
                `;
            });

            updateTotal();
        }

        const savedName = localStorage.getItem('printName');
        const savedDate = localStorage.getItem('printDate');
        if (savedName) document.getElementById('name').value = savedName;
        if (savedDate) document.getElementById('date').value = savedDate;
    }

    function exportToExcel() {
        const nama = document.getElementById('name').value || '-';
        const tanggal = formatDate(document.getElementById('date').value) || '-';
        
        let data = [];
        data.push(['LAPORAN INVENTARIS BARANG']);
        data.push(['']);
        data.push(['Nama:', nama]);
        data.push(['Tanggal:', tanggal]);
        data.push(['']);
        data.push(['No', 'Jenis Barang', 'Banyak', 'Terjual', 'Harga', 'Jumlah']);
        
        let tableBody = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
        for (let i = 0; i < tableBody.rows.length; i++) {
            let row = tableBody.rows[i];
            data.push([
                row.cells[0].innerText,
                row.cells[1].innerText,
                parseInt(row.cells[2].innerText) || 0,
                parseInt(row.cells[3].innerText) || 0,
                parseInt(row.cells[4].innerText) || 0,
                parseInt(row.cells[5].innerText) || 0
            ]);
        }
        
        const total = document.getElementById('totalAmount').innerText;
        data.push(['', '', '', '', 'Total Keseluruhan', total]);
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventaris");
        
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        const fileName = `Inventaris_${nama}_${document.getElementById('date').value}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    function preparePrint() {
        const nama = document.getElementById('name').value || '-';
        const tanggal = document.getElementById('date').value || '-';
        
        document.getElementById('printName').textContent = nama;
        document.getElementById('printDate').textContent = formatDate(tanggal);
        
        localStorage.setItem('printName', nama);
        localStorage.setItem('printDate', tanggal);
        
        window.print();
    }

    function formatDate(dateString) {
        if (dateString === '-') return '-';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    function editRow(button) {
        let row = button.parentElement.parentElement;
        let cells = row.querySelectorAll("td");

        for (let i = 1; i <= 4; i++) {
            let oldValue = cells[i].innerText;
            cells[i].innerHTML = `<input type="text" value="${oldValue}">`;
        }

        button.textContent = "Simpan";
        button.onclick = function() {
            saveRow(this);
        };
    }

    function saveRow(button) {
        let row = button.parentElement.parentElement;
        let cells = row.querySelectorAll("td");

        for (let i = 1; i <= 4; i++) {
            let input = cells[i].querySelector("input");
            cells[i].innerText = input.value;
        }

        let terjual = parseInt(cells[3].innerText) || 0;
        let harga = parseInt(cells[4].innerText) || 0;
        cells[5].innerText = terjual * harga;

        button.textContent = "Edit";
        button.onclick = function() {
            editRow(this);
        };

        updateTotal();
        saveToStorage();
    }

    function deleteRow(button) {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            let row = button.parentElement.parentElement;
            row.remove();
            updateTotal();
            saveToStorage();
            renumberRows();
        }
    }

    function renumberRows() {
        let tableBody = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
        for (let i = 0; i < tableBody.rows.length; i++) {
            tableBody.rows[i].cells[0].innerText = i + 1;
        }
    }

    function addRow() {
        let tableBody = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
        let newRow = tableBody.insertRow();

        newRow.innerHTML = `
            <td>${tableBody.rows.length + 1}</td>
            <td><input type="text" placeholder="Jenis Barang"></td>
            <td><input type="text" placeholder="Banyak"></td>
            <td><input type="text" placeholder="Terjual"></td>
            <td><input type="text" placeholder="Harga"></td>
            <td>0</td>
            <td class="non-printable">
                <button class="edit-btn" onclick="saveNewRow(this)">Simpan</button>
                <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
            </td>
        `;
    }

    function saveNewRow(button) {
        let row = button.parentElement.parentElement;
        let cells = row.querySelectorAll("td");

        for (let i = 1; i <= 4; i++) {
            let input = cells[i].querySelector("input");
            cells[i].innerText = input.value;
        }

        let terjual = parseInt(cells[3].innerText) || 0;
        let harga = parseInt(cells[4].innerText) || 0;
        cells[5].innerText = terjual * harga;

        button.textContent = "Edit";
        button.onclick = function() {
            editRow(this);
        };

        updateTotal();
        saveToStorage();
    }

    function updateTotal() {
        let tableBody = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
        let total = 0;

        for (let i = 0; i < tableBody.rows.length; i++) {
            let row = tableBody.rows[i];
            let amount = parseInt(row.cells[5].innerText) || 0;
            total += amount;
        }

        document.getElementById("totalAmount").innerText = `Rp. ${total.toLocaleString('id-ID')}`;
    }

    function searchTable() {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let table = document.getElementById("inventoryTable");
        let rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

        for (let i = 0; i < rows.length; i++) {
            let jenisBarang = rows[i].cells[1].innerText.toLowerCase();
            if (jenisBarang.includes(input)) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
