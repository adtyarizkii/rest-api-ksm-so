'use strict'

const todo = require('../service/utility_service')

module.exports = (app) => {
    
    // test-api
    app.get('/timbangan/todo', todo.getTodos)
    app.get('/timbangan/todo/:id', todo.getTodo)
    app.post('/timbangan/addtodo', todo.addTodo)
    app.patch('/timbangan/updatetodo/:id', todo.updateTodo)
    app.delete('/timbangan/deletetodo/:id', todo.deleteTodo)
    // test-api

    // PENIMBANGAN
    app.post('/penimbangan/alasan_pergantian_roll', todo.alasan_pergantian_roll)
    app.post('/penimbangan/antrian_penimbangan', todo.antrian_penimbangan)
    app.post('/penimbangan/search_antrian_penimbangan', todo.search_antrian_penimbangan)
    app.post('/penimbangan/batalkan_pencarian', todo.batalkan_pencarian)
    app.post('/penimbangan/batalkan_penimbangan', todo.batalkan_penimbangan)
    app.post('/penimbangan/btn_batalkan_penimbangan', todo.btn_batalkan_penimbangan)
    app.post('/penimbangan/catat_roll_pabrik', todo.catat_roll_pabrik)
    app.post('/penimbangan/cetak_barcode_pecahan', todo.cetak_barcode_pecahan)
    app.post('/penimbangan/cetak_barcode_penimbangan', todo.cetak_barcode_penimbangan)
    app.post('/penimbangan/cetak_ulang', todo.cetak_ulang)
    app.post('/penimbangan/cetak_ulang_bssegel', todo.cetak_ulang_bssegel)
    app.post('/penimbangan/cutting_loss', todo.cutting_loss)
    app.post('/penimbangan/hasil_foto_bs', todo.hasil_foto_bs)
    app.post('/penimbangan/history_cutting_loss', todo.history_cutting_loss)
    app.post('/penimbangan/history_karung', todo.history_karung)
    app.post('/penimbangan/jual_kain', todo.jual_kain)
    app.post('/penimbangan/kain_hilang_identitas', todo.kain_hilang_identitas)
    app.post('/penimbangan/kain_hilang_identitas_input', todo.kain_hilang_identitas_input)
    app.post('/penimbangan/kalibrasi_timbangan', todo.kalibrasi_timbangan)
    app.post('/penimbangan/keterangan_barcode', todo.keterangan_barcode)
    app.post('/penimbangan/keterangan_barcode_input', todo.keterangan_barcode_input)
    app.post('/penimbangan/laporan_bs', todo.laporan_bs)
    app.post('/penimbangan/list_batal_penimbangan', todo.list_batal_penimbangan)
    app.post('/penimbangan/lokasi_karung', todo.lokasi_karung)
    app.post('/penimbangan/master_timbangan', todo.master_timbangan)
    app.post('/penimbangan/pecah_roll', todo.pecah_roll)
    app.post('/penimbangan/pembentukan_karung', todo.pembentukan_karung)
    app.post('/penimbangan/scan_pembentukan_karung', todo.scan_pembentukan_karung)
    app.post('/penimbangan/penimbangan2', todo.penimbangan2)
    app.post('/penimbangan/pergantian_barcode', todo.pergantian_barcode)
    // app.post('/penimbangan/perincian_kainstok', todo.perincian_kainstok)
    app.post('/penimbangan/pilih_kain', todo.pilih_kain)
    app.post('/penimbangan/pilih_kain_pengganti', todo.pilih_kain_pengganti)
    app.post('/penimbangan/pilih_lokasi_dibawah_1kg', todo.pilih_lokasi_dibawah_1kg)
    app.post('/penimbangan/potong_kain', todo.potong_kain)
    app.post('/penimbangan/scan_id', todo.scan_id)
    app.post('/penimbangan/stok_opname_kg', todo.stok_opname_kg)
    app.post('/penimbangan/terima_retur', todo.terima_retur)
    app.post('/penimbangan/btn_terima_retur', todo.btn_terima_retur)
    app.post('/penimbangan/timbang_dibawah_1kg', todo.timbang_dibawah_1kg)
    app.post('/penimbangan/timbang_kain', todo.timbang_kain)
    app.post('/penimbangan/timbang_ulang_kain', todo.timbang_ulang_kain)
    app.post('/penimbangan/track_roll_qpecah', todo.track_roll_qpecah)
    app.post('/penimbangan/track_roll_qcustomer', todo.track_roll_qcustomer)
    app.post('/penimbangan/update_kain', todo.update_kain)
    app.post('/penimbangan/verifikasi_kain', todo.verifikasi_kain)
    // PENIMBANGAN

}