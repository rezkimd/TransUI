document.getElementById('confirmBtn').addEventListener('click', function () {
    // Mengambil nilai jumlah top-up dari input
    var amount = document.getElementById('amount').value;

    // Mengirim permintaan ke server
    fetch('/api/top_up', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amount })
    })
        .then(response => response.json())
        .then(result => {
            // Menampilkan pesan atau melakukan tindakan lain sesuai respons dari server
            console.log(result);
            // Lakukan tindakan setelah saldo berhasil diperbarui
            // Contoh: tampilkan pesan sukses, perbarui tampilan saldo, dll.
        })
        .catch(error => {
            console.error('Error:', error);
            // Menampilkan pesan atau melakukan tindakan lain jika terjadi kesalahan
        });
});

function topUp() {
    var amount = document.getElementById('display').innerHTML;

    // Mengirim permintaan ke server
    fetch('/api/top_up', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amount })
    })
        .then(response => response.json())
        .then(result => {
            // Menampilkan pesan atau melakukan tindakan lain sesuai respons dari server
            console.log(result);
            // Lakukan tindakan setelah saldo berhasil diperbarui
            // Contoh: tampilkan pesan sukses, perbarui tampilan saldo, dll.

            // Arahkan halaman ke profile.html
            window.location.href = 'profile.html';
        })
        .catch(error => {
            console.error('Proses Top up terganggu', error);
            window.location.href = 'profile.html';
            // Menampilkan pesan atau melakukan tindakan lain jika terjadi kesalahan
        });
}