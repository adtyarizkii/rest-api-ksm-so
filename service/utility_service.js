'use strict';
const response = require('../res/res')
const tabel = require('../conn/tabel');
const e = require('cors');

let querystr = '';
let queryvalue = '';

// TEST-API
exports.getTodos = async (req, res) => {
    try {
        let data = []
        querystr = `SELECT * FROM todos;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
             data = hasil.rows
        })
        response.ok(data, 200, res)
    } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
    }
}

exports.getTodo = async (req, res) => {
    try {
        let data = []
        let {id} = req.params;
        querystr = `SELECT * FROM todos WHERE id=?;`
        queryvalue = [id]
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
             data = hasil.rows
        })
        response.ok(data, 200, res)
    } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
    }
}

exports.addTodo = async (req, res) => {
    try {
    let data = []
    let { todo, isDone } = req.body
    if (todo == '' || isDone == '' && todo == undefined || isDone == undefined) {
        data = 'Silahkan isi fields yang ada'
    } else {
    querystr = `INSERT INTO todos (todo,isDone) VALUES ('${todo}','${isDone}');`
    queryvalue = []
    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
      data = hasil.rows
    })
    }
    response.ok(data, 200, res)
  } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
  }
}

exports.updateTodo = async (req, res) => {
    try {
        let data = [];
        let { todo, isDone } = req.body;
        let { id } = req.params;
        querystr = `UPDATE todos 
        SET todo=COALESCE(NULLIF('${todo}', ''),todo),
        isDone=COALESCE(NULLIF('${isDone}', ''),isDone) WHERE id=${id};`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
          data = hasil.rows
        })   
        response.ok(data, 200, res)
      } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
      }
}

exports.deleteTodo = async (req, res) => {
    try {
        let data = [];
        let { id } = req.params;
        querystr = `DELETE FROM todos WHERE id=${id};`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
          data = hasil.rows
        })
        response.ok(data, 200, res)
      } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
      }
}

// PENIMBANGAN

// falamatpengiriman (no query)

// falasanpergantianroll (v) gg
exports.alasan_pergantian_roll = async (req, res) => {
    try {
        let data = []
        let { alasan } = req.body;
        if (alasan == '' || alasan == undefined) {
            data = 'Alasan tidak boleh kosong!'
        } else {
            let { no_roll, kode } = req.body;
            querystr = `SELECT no_roll FROM perincian_penerimaanstok WHERE no_roll='${no_roll}' AND kode='${kode}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'No Roll atau Kode Verifikasi salah! '
                } else {
                    let { no_order, roll_awal, idKaryawan } = req.body;
                    querystr = `CALL sp_ubahrollpencarian_dibawah1kg('${no_order}', '${roll_awal}', '${no_roll}', '${alasan}', ${idKaryawan});`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        const message = hasil.rows[0][0].message
                        if (hasil.rows.length == 0 || hasil.rows.length > 0 || hasil.rows[0][0].status != 200) {
                            if (hasil.rows.length > 0) {
                                data = 'Data gagal diupdate, silahkan ulang lagi!' + ' ' + message
                            } else {
                                data = 'Data gagal dipudate, silahkan ulang lagi!'
                            }
                        } else {
                            data = 'No Roll berhasil diupdate'
                        }
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
    }
}

// fambilkain (no query)

// fantrianpenimbangan (v) gg
exports.antrian_penimbangan = async (req, res) => {
    let data = []
    try {
        querystr = `SELECT *,IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) 
        WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT', IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) 
        WHERE jenis_quantity='KGAN' AND pr.status=1 AND no_order=va.no_order)>0,'PROSES','')) AS statusambil 
        FROM v_antrianpenimbanganfix va LEFT JOIN (SELECT no_order, COUNT(no_roll) AS jmlsisapotong FROM detail_order JOIN perincian_order pr USING(no_Detail)  
        WHERE jenis_quantity='KGAN' AND pr.status=1 AND berat_ditimbang=0 GROUP BY no_order ) AS p ON va.no_order=p.no_order;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

exports.search_antrian_penimbangan = async (req, res) => {
    let data = []
    let { search, no_order } = req.body;
    let kode
    try {
        querystr = `select no_roll from perincian_penerimaanstok where no_roll='${search}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            if (hasil.rows.length == 0) {
                querystr = `SELECT *,IF((SELECT COUNT(no_roll) AS jml FROM detail_order d JOIN perincian_order pr USING(no_Detail)  WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT',
                IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND no_order=va.no_order)>0,'PROSES','')) AS statusambil 
                FROM v_antrianpenimbanganfix va LEFT JOIN (SELECT no_order, COUNT(no_roll) AS jmlsisapotong FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND berat_ditimbang=0 GROUP BY no_order ) 
                AS p ON va.no_order=p.no_order  WHERE nama LIKE '%${search}%';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    data = hasil.rows
                })
            } else {
                querystr = `SELECT *,IF((SELECT COUNT(no_roll) AS jml FROM detail_order d JOIN perincian_order pr USING(no_Detail)  WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT',
                IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND no_order=va.no_order)>0,'PROSES','')) AS statusambil
                FROM v_antrianpenimbanganfix va LEFT JOIN (SELECT no_order, COUNT(no_roll) AS jmlsisapotong FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 
                AND berat_ditimbang=0 GROUP BY no_order ) AS p ON va.no_order=p.no_order WHERE va.no_order IN (SELECT no_order FROM detail_order JOIN perincian_order USING (no_detail) WHERE no_roll='${search}')`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length == 1) {
                        querystr = `SELECT nama FROM a_hold_order LEFT JOIN user USING(id_user) WHERE no_order='${no_order}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                            if (hasil.rows.length != 0){
                                data = `Order ${no_order} sedang di edit oleh Admin ${hasil.rows[0]}`
                            } else {
                                data = `Empty`
                            }
                        })
                    } else {
                        data = 'Kain tersebut tidak terdaftar di list order mana pun'
                    }
                })
            }
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fbackground (no query)

// fbatalkanpencarian (v) gg
exports.batalkan_pencarian = async (req, res) => {
    try {
        let data = []
        querystr = `select * from v_penimbangan2 where sts=1;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
             data = hasil.rows
        })
        response.ok(data, 200, res)
    } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
    }
}

// fbatalkanpenimbangan (v) gg
exports.batalkan_penimbangan = async (req, res) => {
    try {
        let data = []
        querystr = `SELECT roll1 AS roll1,roll2 AS roll_pecahan,po.berat AS border,
        po.berat_ditimbang AS b_timbang,no_order,dr.jenis_kain,dr.warna
        FROM detail_order dr JOIN group_penimbangan gp ON dr.no_Detail=gp.no_detailorder
        JOIN perincian_order po ON po.no_detail=dr.no_Detail ORDER BY gp.no DESC;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
             data = hasil.rows
        })
        response.ok(data, 200, res)
    } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
    }
}

// fbtnbatalkanpenimbangan (v) gg
exports.btn_batalkan_penimbangan = async (req, res) => {
    let data = []
    let { kode, no_roll, noroll2, berat1 } = req.body;
    let bplastik, nopengeluaran, nodetail, kodekoreksi;
    try {
        if ( kode == '' || kode == undefined) {
            data = 'Silahkan isi kode unik pada barcode!'
        } else {
            querystr = `SELECT * FROM  perincian_penerimaanstok WHERE no_roll='${no_roll}' AND kode='${kode}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'Kode verifikasi atau no roll salah!'
                } else {
                    querystr = `SELECT jenis_kain FROM detail_penerimaanstok JOIN perincian_penerimaanstok pp USING(no_Detail) WHERE no_roll='${no_roll}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows[0].jenis_kain == 'BODY') {
                            bplastik = 0.16
                        } else {
                            bplastik = 0.12
                        }
                        querystr = `select * from perincian_pengeluaranstok where no_roll='${noroll2}' and berat > 0;`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                            if (hasil.rows.length > 0) {
                                data = `Pecah roll tidak dapat dibatalkan karena sudah ada penjualan untuk no roll ${noroll2}`
                            } else {
                                querystr = `START TRANSACTION`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()
                                
                                querystr = `delete from perincian_penerimaanstok where no_roll='${noroll2}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `delete from data_pecahroll where roll1='${no_roll}' and roll2='${noroll2}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()
                                
                                querystr = `update perincian_penerimaanstok set berat=berat+'${berat1}' where no_roll='${no_roll}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()
                                
                                querystr = `SELECT no_pengeluaran,no_detail FROM penjualan_kainstok pk JOIN detail_pengeluaranstok dp USING(no_pengeluaran) 
                                JOIN perincian_pengeluaranstok pps USING(no_detail) WHERE no_roll='${noroll2}' 
                                AND pk.penjualan_melalui='KOREKSI TIMBANGAN'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                    if (hasil.rows.length > 0) {
                                        nopengeluaran = hasil.rows[0].no_pengeluaran
                                        nodetail = hasil.rows[0].no_detail

                                        querystr = `delete from perincian_pengeluaranstok where no_roll='${noroll2}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()
                                        
                                        querystr = `delete from detail_pengeluaranstok where no_detail='${nodetail}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        querystr = `delete from penjualan_kainstok where no_pengeluaran='${nopengeluaran}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()
                                        data = 'DONE'
                                    } else {
                                        querystr = `SELECT no_pengeluaran,no_detail FROM penjualan_kainstok pk 
                                        JOIN detail_pengeluaranstok dp USING(no_pengeluaran) JOIN perincian_pengeluaranstok pps USING(no_detail) 
                                        WHERE no_roll='${no_roll}' AND pk.penjualan_melalui='UBAH NETTO'  AND tanggal=CURDATE()`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                            if (hasil.rows.length > 0){
                                                nopengeluaran = hasil.rows[0].no_pengeluaran

                                                querystr = `delete from penjualan_kainstok where no_pengeluaran='${nopengeluaran}'`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `UPDATE detail_order  SET dikerjakan='SIAP POTONG'
                                                WHERE no_detail=(SELECT no_detail FROM perincian_order WHERE no_roll='${noroll2}')`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `UPDATE perincian_order  SET berat_ditimbang=0,habis='',no_rolldisimpan='',no_roll='${no_roll}'  
                                                WHERE no_roll='${noroll2}'`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `UPDATE perincian_penerimaanstok SET STATUS=0  WHERE no_roll='${no_roll}';`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `SELECT * FROM group_penimbangan WHERE roll1='${no_roll}' AND roll2='${noroll2}';`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                                    kodekoreksi = hasil.rows[0].kode_koreksi

                                                    if (kodekoreksi != '') {
                                                        querystr = `DELETE FROM penjualan_kainstok WHERE no_pengeluaran='${kodekoreksi}' AND penjualan_melalui='KOREKSI TIMBANGAN';`
                                                        queryvalue = []
                                                        await tabel.queryDB(querystr, queryvalue).then()
                                                    }
                                                })

                                                querystr = `delete from  group_penimbangan where roll1='${no_roll}' and roll2='${noroll2}'`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `COMMIT`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()

                                                data = `Data berhasil di hapus`
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    })
                }
                // console.log(bplastik);
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
    }
}

// fcatatrollpabrik (v) gg 0.5
exports.catat_roll_pabrik = async (req, res) => {
    let data = [];
    let brutto, limit, bert, stsproses, pesan;
    let { berat_timbang_awal, no_roll_toko } = req.body;
    try {
        if (berat_timbang_awal == '' || berat_timbang_awal == undefined) {
            data = 'Silahkan isi berat timbang awal terlebih dahulu!'
        } else if (berat_timbang_awal == '0' || berat_timbang_awal == 0) {
            data = 'Berat tidak boleh 0 !'
        } else if (berat_timbang_awal > 35) {
            data = 'Berat timbang awal tidak boleh lebih dari 35'
        } else {
        querystr = `SELECT berat FROM perincian_penerimaanstok WHERE no_roll='${no_roll_toko}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            brutto = hasil.rows[0].berat;
            
            bert = (brutto - (parseFloat(berat_timbang_awal))) + 0.01;
            // console.log('ini bert:', bert);

            limit = (bert / brutto) * 100;
            // console.log('ini limit:', limit);

            let abss = Math.abs(bert)

            if (abss > 10){
                data = 'Selisih tidak boleh lebih atau kurang dari 10 KG!'
            } else {
                querystr = `SELECT no_roll FROM n_stok JOIN kain USING(id_kain) WHERE no_roll ='${no_roll_toko}' AND nama_kain LIKE '%pique%';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length > 0) {
                        if (Math.abs(limit) >= 9) {
                            stsproses = 'JALAN'
                        } else {
                            stsproses = 'STOP'
                        }
                    } else {
                        querystr = `SELECT no_roll FROM n_stok JOIN kain USING(id_kain) WHERE no_roll ='${no_roll_toko}' AND nama_kain LIKE '%fleece%';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                            if (hasil.rows.length > 0) {
                                if (Math.abs(limit) >= 13) {
                                    data = `Data brutto dan netto ada selisih ${parseFloat(limit)}% apakah Anda yakin akan menyimpan data?`
                                    if (pesan == 'YES') {
                                        stsproses = 'JALAN'
                                    } else {
                                        stsproses = 'STOP'                                        
                                    }
                                } else if (Math.abs(limit) >= 8 && Math.abs(limit) <= 15) {
                                    data = `Data brutto dan netto ada selisih ${parseFloat(limit)}% apakah Anda yakin akan menyimpan data?`
                                    if (pesan == 'YES') {
                                        stsproses = 'JALAN'
                                    } else {
                                        stsproses = 'STOP'                                        
                                    }
                                } else if (Math.abs(limit)>15) {
                                    if (pesan == 'YES') {
                                        stsproses = 'JALAN'
                                    } else {
                                        stsproses = 'STOP'                                        
                                    }
                                }
                                if (stsproses == 'JALAN') {
                                    data = 'Berhasil di simpan'
                                } else {
                                    data = 'Simpan dibatalkan'
                                }
                            } else {
                                data = 'Empty!'
                            }
                        })
                    }
                })
            }

        })}
        response.ok(data, 200, res)
    } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
    }
}

// fcetakbarcodepecahan (v) gg
exports.cetak_barcode_pecahan = async (req, res) => {
    let data1 = []
    querystr = `SELECT * FROM cetak_barcodetimbangan WHERE catatan='BAGUS' OR ((catatan='BS' OR catatan='SEGEl') AND berat > 1) ORDER BY NO DESC LIMIT 10;`
    queryvalue = []
    await tabel.queryDB(querystr, queryvalue).then(async function(hasil) {
        console.log(hasil.rows);
        if (hasil.rows.length == 0) {
            data1 = 'Tidak ada data yang bisa di print ulang!'
        } else {
            data1 = hasil.rows;
        }
    })
    response.ok(data1, 200, res)
}

// fcetakbarcodepenimbangan (v) gg
exports.cetak_barcode_penimbangan = async (req, res) => {
    let data1 = []
    try {
        querystr = `SELECT * FROM group_penimbangan ORDER BY NO DESC LIMIT 30;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil) {
            if (hasil.rows.length == 0) {
                data1 = 'Tidak ada data yang bisa di print ulang!'
            } else {
                data1 = hasil.rows;
            }
        })
        response.ok(data1, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fcetakulang (v) gg
exports.cetak_ulang = async (req, res) => {
    let data = []
    let { noroll, unik } = req.body;
    let berat, jkn2, wrn2, kodeverifikasi;
    try {
        querystr = `SELECT * FROM perincian_penerimaanstok WHERE no_roll='${noroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            if (hasil.rows.length == 0) {
                data = 'No roll tidak terdaftar di Stok'
            } else {
                querystr = `SELECT * FROM perincian_penerimaanstok WHERE no_roll='${noroll}' AND kode='${unik}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length == 0) {
                        data = 'Kode Verifikasi salah!'
                    } else {
                        querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${noroll}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                            if (hasil.rows.length == 0) {
                                querystr = `CALL cekystokall('${noroll}');`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                    data = hasil.rows
                                })
                            } else {
                                berat = hasil.rows[0].berat_asal
                                jkn2 = hasil.rows[0].nama_kain
                                wrn2 = hasil.rows[0].jenis_warna
                                kodeverifikasi = hasil.rows[0].kode
        
                                data = {
                                    berat: berat,
                                    nama_kain: jkn2,
                                    jenis_warna: wrn2,
                                    kode_verifikasi: kodeverifikasi
                                }
                            }
                        })
                    }
                })
                
            }
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fcetakulangbssegel (v) gg
exports.cetak_ulang_bssegel = async (req, res) => {
    let data1 = []
    querystr = `SELECT * FROM (SELECT no,tanggal,tipe,total,nk.id_user,CONCAT(total,' Kg') AS brt,nama, IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainbssegel WHERE no_kainbssegel=nk.no ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang, kode,CONCAT(IF(tipe = 'SEGEL','SG',tipe),YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2 FROM n_kainbssegel nk JOIN user USING(id_user) UNION SELECT no_sample AS no,tanggal,'SAMPLE' tipe,total,nk.id_user,CONCAT(total,' Kg') AS brt,nama, IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainsample WHERE no_sample=nk.no_sample ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang, kode_sample AS kode,CONCAT('SM',YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2 FROM n_kainsample nk JOIN user USING(id_user)) AS v`
    queryvalue = []
    await tabel.queryDB(querystr, queryvalue).then(async function(hasil) {
        if (hasil.rows.length == 0) {
            data1 = 'Tidak ada data yang bisa di print ulang!'
        } else {
            data1 = hasil.rows;
        }
    })
    response.ok(data1, 200, res)
}

// fcuttingloss (v) gg
exports.cutting_loss = async (req, res) => {
    try {
        let data = []
        querystr = `SELECT n.no_roll,n.berat,IF(v.no_roll IS NULL,'Belum Penettoan','Sudah Penettoan') AS sts,jenis_kain
        FROM n_stok n
        LEFT JOIN (SELECT no_roll FROM penjualan_kainstok JOIN detail_pengeluaranstok USING(no_pengeluaran) JOIN perincian_pengeluaranstok USING(no_detail)
        WHERE penjualan_melalui='UBAH NETTO') AS v USING(no_roll)
        WHERE jenis='CUTTING LOSS' ORDER BY sts,no_roll`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil) {
            data = hasil.rows
        })
    } catch (error) {
        response.ok(tabel.GetError(error), 301,res)
    }
}

// ffotobs (no query)

// fhasilfotobs (v) gg
exports.hasil_foto_bs = async (req, res) => {
    let data = []
    let alamat, nama, nm;
    let { noroll } = req.body;
    try {
        querystr = `SELECT nama FROM alamat_fhoto WHERE kategori='KAINBS';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            if (hasil.rows.length == 0) {
                data = 'Alamat foto kain bs tidak terdaftar, silahkan hubungi bagian IT'
            } else {
               alamat = hasil.rows[0].nama

               querystr = `SELECT IFNULL(MAX(nama),'kosong') AS data FROM n_fhotobs WHERE no_roll='${noroll}';`
               queryvalue = []
               await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    nama = noroll + 'F1'
                } else {
                    nm = hasil.rows[0].data
                    nama = noroll + 'F' + nm
                }
               })
               data = {
                alamat_foto: alamat,
                nama_file: nama
               }
            }
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fhistorycuttingloss (v) gg
exports.history_cutting_loss = async (req, res) => {
    try {
        let data = []
        querystr = `SELECT n.no_roll,n.jenis_kain,berat_roll2 as berat,tanggal_roll2 AS tanggal_netto,nama
        FROM n_stok n
        JOIN (SELECT no_roll,nama 
        FROM penjualan_kainstok JOIN detail_pengeluaranstok USING(no_pengeluaran) JOIN perincian_pengeluaranstok USING(no_detail) JOIN user USING(id_user)
        WHERE penjualan_melalui='UBAH NETTO') AS v USING(no_roll)
        JOIN (SELECT * FROM n_stokopnametimbang WHERE jenis_transaksi='PENETTOAN') nt ON n.no_roll=roll1
        WHERE jenis='CUTTING LOSS'  ORDER BY tanggal_roll2,no_roll`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fhistorikarung (v) gg
exports.history_karung = async (req, res) => {
    try {
        let data = []
        querystr = `SELECT no_karung,CONCAT(berat_dibawah,'-',berat_diatas) AS kategori,SUM(berat) AS berat,no_lokasi,COUNT(no_roll) AS jml
        FROM n_kategori_karung n JOIN n_kategori_karung_detail USING(no_karung) WHERE STATUS> 0 GROUP BY no_karung`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fjualkain (v) gg
exports.jual_kain = async (req, res) => {
    let data = []
    let { namacus, harga, no_pengeluaran, nosj, idKaryawan } = req.body;
    let idcustomer, tgl;
    const now = new Date();
    const yyyy = now.getFullYear();
    let mm = now.getMonth() + 1;
    let dd = now.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    // console.log('SEKARANG TANGGAL:', yyyy + '-' + mm + '-' + dd);
    try {
        querystr = `SELECT apr.*, ap.harga FROM a_penjualankainstok ap INNER JOIN a_perincian_penjualanstok apr USING(no_pengeluaran);`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            if (hasil.rows.length == 0) {
                data = 'Transaksi belum bisa disimpan karena detail transaksi masih kosong!'
            } else if (namacus == '' || namacus == undefined) {
                data = 'Customer harus diisi!'
            } else if (harga == '' || harga == undefined) {
                data = 'Harga harus diisi!'
            } else {
                querystr = `select * from customer where nama='${namacus}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length == 0) {
                        data = 'Customer tidak terdaftar di database'
                    } else {
                        idcustomer = hasil.rows[0].id_customer
                        tgl = yyyy + '-' + mm + '-' + dd
                        
                        if (nosj == '' || nosj == 0 || nosj == undefined) {
                            data = 'No sj tidak boleh kosong!'
                        } else if (idcustomer == '' || idcustomer == 0 || idcustomer == undefined) {
                            data = 'ID Customer tidak boleh kosong!'
                        } else if (no_pengeluaran == '' || no_pengeluaran == 0 || no_pengeluaran == undefined) {
                            data = 'No pengeluaran tidak boleh kosong!'
                        } else {
                            querystr = `START TRANSACTION`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()                                
                            
                            querystr = `UPDATE a_penjualankainstok SET no_sj='${nosj}',id_customer='${idcustomer}',tanggal='${tgl}',catatan='${idKaryawan}',id_user='43',jenis_kain='WARNA',STATUS=1, harga='${harga}' WHERE no_pengeluaran='${no_pengeluaran}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                                
                            querystr = `COMMIT`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            data = `Data berhasil disimpan`
                            }
                        }

                })
            }
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fkainhilangidentitas (v) gg
exports.kain_hilang_identitas = async (req, res) => {
    try {
        let data = []
        querystr = `select *,concat(berat,'Kg') as brt from n_kainhilangidentitas`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

exports.kain_hilang_identitas_input = async (req, res) => {
    let data = []
    let { button3, twarna, tberat, tnoroll, tjeniskain, tlebar, tlot, idKaryawan, qhilang} = req.body;
    let no
    try {
        if (button3 == ' (ENTER) Simpan') {
            if (twarna == '' || twarna == undefined) {
                data = 'Warna harus diisi!'
            } else if (tberat == '' || tberat == 0 || tberat == undefined) {
                data = 'Berat tidak boleh kosong atau 0 !'
            } else {
                querystr = `START TRANSACTION`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
    
                querystr = `INSERT INTO n_kainhilangidentitas VALUES(0,'${tnoroll}', '${tjeniskain}', '${twarna}', '${tlebar}', '${tlot}', '${tberat}', '${idKaryawan}' )`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
    
                querystr = `SELECT MAX(NO) AS NO FROM n_kainhilangidentitas;`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    no = hasil.rows[0].no
                })
            }
        } else {
                querystr = `SELECT * FROM n_kainhilangidentitas WHERE no_roll='${tnoroll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length == 0) {
                        data = 'Data tidak ada, silahkan refresh!'
                    } else {
                        querystr = `UPDATE n_kainhilangidentitas SET nama_kain='${tjeniskain}', warna='${twarna}', lebar='${tlebar}',
                        lebar='${tlebar}',lot='${tlot}', berat='${tberat}', id_user='${idKaryawan}' 
                        WHERE NO='${qhilang}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        querystr = `COMMIT`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        data = `Data berhasil di edit`
                    }
                })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fkalibrasitimbangan (v) gg
exports.kalibrasi_timbangan = async (req, res) => {
    let data = []
    let { btimbangan } = req.body;
    let vidtimbangan, vtimbangan, ip;
    try {
        if (btimbangan == '' || btimbangan == undefined) {
            data = 'Silahkan scan barcode timbangan!'
        } else {
            querystr = `SELECT * FROM n_master_penimbangan WHERE id_timbangan='${btimbangan}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'Timbangan tidak terdaftar silahkan ulangi!'
                } else {
                    vidtimbangan = hasil.rows[0].id_timbangan
                    vtimbangan = hasil.rows[0].timbangan
                    ip = hasil.rows[0].ip_address

                    querystr = `update n_master_penimbangan set ip_address=null,is_used=0 where ip_address='${ip}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `update n_master_penimbangan set ip_address='${ip}',is_used=1 where id_timbangan='${vidtimbangan}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        data = hasil.rows
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fketeranganbarcode (v) gg
exports.keterangan_barcode = async (req, res) => {
    let data = []
    try {
        querystr = `SELECT keterangan FROM n_keterangan_cetakulang ORDER BY id ;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

exports.keterangan_barcode_input = async (req, res) => {
    let data = []
    let { vket, noroll, statusproses, idKaryawan } = req.body
    try {
        if (vket == '' || vket == undefined) {
            data = 'Keterangan tidak boleh kosong !'
        } else {
            querystr = `INSERT INTO n_cetakulang_barcode
            VALUES(0,NOW(),'${noroll}','${statusproses}','${vket}','${idKaryawan}')`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                data = hasil.rows;
            })
        }

        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// flaporanbs (v) gg
exports.laporan_bs = async (req, res) => {
    let data = []
    let t2, wnotin, tipe, wmin, cekmasuk, idKaryawan;
    let { hari , tipekain } = req.body
    try {
        const now = new Date();
        const yyyy = now.getFullYear();
        let mm = now.getMonth() + 1;
        let dd = now.getDate();
        
        const now1 = new Date() - 1;
        const yyyy1 = now1.getFullYear();
        let mm1 = now1.getMonth() + 1;
        let dd1 = now1.getDate();
    
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        
        if (dd1 < 10) dd1 = '0' + dd1;
        if (mm1 < 10) mm1 = '0' + mm1;

        if (hari == 'SEKARANG') {
            t2 = `${yyyy}-${mm}-${dd}`
        } else {
            t2 = `${yyyy1}-${mm1}-${dd1}`
        }

        if ('1M', tipekain.toUpperCase() > 0 && 'BS', tipekain.toUpperCase() > 0) {
            tipe = 'BS'
        } else if ('1M', tipekain.toUpperCase() > 0 && 'SEGEL', tipekain.toUpperCase() > 0) {
            tipe = 'SEGEL'
        } else {
            tipe = tipekain
        }

        if (tipekain == 'SAMPLE') {
            wnotin = 'AND no_roll NOT IN (SELECT no_roll FROM n_detail_kainsample)'
        } else {
            wnotin = 'AND no_roll NOT IN (SELECT no_roll FROM n_detail_kainbssegel)'
        }

        if ('>', tipekain > 0) {
            wmin = 'AND no_roll in (select no_roll from n_kainbssegel_meter WHERE berat >= berat_master)'
        } else if ('<', tipekain > 0) {
            wmin = 'AND no_roll in (select no_roll from n_kainbssegel_meter WHERE berat < berat_master)'
        } else {
            wmin = 'AND no_roll not in (select no_roll from n_kainbssegel_meter)';
        }

        if (cekmasuk == 'SAMPLE') {
            querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll) 
            JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
            WHERE LOWER(no_lokasi) ='sample' AND id_user='${idKaryawan}' AND status_kain='${tipe}'
            AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND CAST(tgl_terima AS DATE) >= (SELECT DATA FROM konstanta WHERE jenis='TANGGAL BS SEGEL') AND CAST(tgl_terima AS DATE) < CURDATE() 
            AND kc.catatan <> 'SISA POTONG' ${wnotin} ${wmin}`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                data = hasil.rows;
            })
        } else if (cekmasuk == 'BELUM') {
            querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll) 
            JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
            WHERE LOWER(no_lokasi) !='bs-retur' AND id_user='${idKaryawan}' and status_kain='${tipe}'
            AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND CAST(tgl_terima AS DATE) >= (SELECT DATA FROM konstanta WHERE jenis='TANGGAL BS SEGEL') AND CAST(tgl_terima AS DATE) < CURDATE() 
            AND kc.catatan <> 'SISA POTONG' ${wnotin} ${wmin}`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                data = hasil.rows;
            })      
        } else {
            querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll) 
            JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
            WHERE LOWER(no_lokasi) !='bs-retur' AND id_user='${idKaryawan}' AND status_kain='${tipe}' 
            AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND DATE_FORMAT(tgl_terima,'%Y-%m-%d')='${t2}' AND kc.catatan <> 'SISA POTONG' ${wnotin} ${wmin}`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                data = hasil.rows;
            })      
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// flistbatalpenimbangan (v) gg [-btn cetak ulang barcode]
exports.list_batal_penimbangan = async (req, res) => {
    try {
        let data = []
        querystr = `SELECT p.no, no_roll,nama_kain,jenis_warna FROM pembatalan_penimbangan p JOIN perincian_penerimaanstok USING(no_roll) JOIN detail_penerimaanstok USING(no_detail)
        JOIN kain USING(id_kain) JOIN warna USING(id_warna)
        WHERE p.status=0;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// flokasikarung (v) gg
exports.lokasi_karung = async (req, res) => {
    let data = []
    let { lokasi, no_karung } = req.body;
    try {
        if (lokasi == '' || lokasi == undefined) {
            data = ' Lokasi tidak boleh kosong!'
        } else {
            querystr = `SELECT no_lokasi FROM lokasi WHERE no_lokasi='${lokasi}}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'Lokasi tidak ada dalam sistem!'
                } else {
                    querystr = `UPDATE n_kategori_karung SET no_lokasi='${lokasi}' WHERE no_karung='${no_karung}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        data = hasil.rows
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fmastertimbangan (v) gg
exports.master_timbangan = async (req, res) => {
    let data = []
    try {
        querystr = `select id_timbangan,timbangan,ip_address,if(is_active=1,'Yes','No') as is_active,if(is_used=1,'Yes','No') as is_used from n_master_penimbangan where is_active=1 order by timbangan`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fmessage (no query)

// fpecahroll (v) gg
exports.pecah_roll = async (req, res) => {
    let data = []
    let { no_roll , verifikasi } = req.body;
    let tipekain, tstok;
    try {
        querystr = `SELECT * FROM perincian_penerimaanstok p JOIN detail_penerimaanstok d USING(no_detail) JOIN kain k USING(id_kain)
        WHERE no_roll='${no_roll}' AND kode='${verifikasi}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            if (hasil.rows.length == 0) {
                data = 'Kode Verifikasi Salah!'
            } else {
                tipekain = hasil.rows[0].tipe_kain
                querystr = `SELECT * FROM detail_order JOIN perincian_order po USING(no_detail) JOIN penjagaan_timbangan pt ON po.no=pt.no_perincian 
                WHERE dikerjakan='SIAP KIRIM' AND no_roll='${no_roll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length > 0){
                        data = 'Kain tidak bisa di pecah karena kain sudah dipotong, silahkan hubungi bagian packing'
                    } else {
                        querystr = `SELECT no_order,nama FROM v_stokglobal_transfer v JOIN perincian_order p USING(no_roll) JOIN detail_order d ON p.no_detail=d.no_detail 
                        JOIN order_pembelian USING(no_order) JOIN customer USING(id_customer)
                        WHERE sts='ROLLAN' AND jenis_quantity='ROLLAN' AND v.no_roll='${no_roll}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                            if (hasil.rows.length > 0) {
                                data = 'Kain tersebut tidak boleh di pecah karena sedang di booking ...'
                            } else {
                                querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${no_roll}';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                    if (hasil.rows[0].sts == 'ROLLAN' && hasil.rows[0].b_order == 0) {
                                        querystr = `SELECT nama_kain FROM v_stokrollansementara 
                                        WHERE nama_kain='${hasil.rows[0].nama_kain}' 
                                        AND jenis_warna='${hasil.rows[0].jenis_warna}' 
                                        AND kode_spk='${hasil.rows[0].kode_spk}';`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                            if (hasil.rows.length == 0) {
                                                data = 'Kain tersebut tidak boleh di pecah karena sedang di booking oleh order lain dan belum di scan!'
                                            } else {
                                                data = hasil.rows
                                            }
                                        })
                                    } else {
                                        querystr = `SELECT IFNULL(berat_asal,'kosong') AS berat_asal,IFNULL(berat,'kosong') AS berat,IFNULL(b_order,'kosong') 
                                        asberat_order,IFNULL(sts,'kosong') AS sts,IFNULL(kode,'kosong') AS kode FROM v_stokglobal_transfer 
                                        WHERE no_roll='${no_roll}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                            tstok = hasil.rows[0].berat_asal
                                            data = hasil.rows;
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fpembentukankarung (v) gg
exports.pembentukan_karung = async (req, res) => {
    let data = []
    try {
        querystr = `SELECT no_roll,nama_kain,jenis_warna,no_lokasi,n.berat AS berat_asal 
        FROM n_kategori_karung_detail JOIN n_stok n USING(no_roll) JOIN kain k USING(id_kain) JOIN warna w USING(id_warna)`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

exports.scan_pembentukan_karung = async (req, res) => {
    let data = []
    let { noroll, nokarung } = req.body;
    let jeniskain, berat, kain, warna, berat_dibawah, berat_diatas;
    try {
        querystr = `SELECT jenis_kain,berat_asal,nama_kain,jenis_warna FROM v_stokglobal WHERE no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            jeniskain = hasil.rows[0].jenis_kain
            berat = hasil.rows[0].berat_asal
            kain = hasil.rows[0].nama_kain
            warna = hasil.rows[0].jenis_warna

            if (hasil.rows.length == 0) {
                data = 'Kain tidak terdaftar pada sistem'
            } else {
                querystr = `SELECT no_roll FROM n_kategori_karung_detail WHERE no_roll='${noroll}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length > 0) {
                        data = 'Kain sudah di scan'
                    } else {
                if (jeniskain != 'BODY') {
                    data = 'Hanya kain body yang bisa discan'
                } else {
                    querystr = `SELECT berat_dibawah,berat_diatas FROM n_kategori_karung JOIN n_kategori_karung_detail USING(no_karung) WHERE no_karung='${nokarung}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows.length == 0) {
                            querystr = `SELECT id,berat_dibawah,berat_diatas FROM s_kategori_berat_lelang WHERE UPPER(sts_kategori)='AKTIF' AND tanggal_efektif<=NOW() AND ${berat} BETWEEN berat_dibawah AND berat_diatas;`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                if (hasil.rows.length == 0) {
                                    data = 'Scan gagal, karena kain tidak masuk ke dalam kategori manapun'
                                } else {
                                    berat_diatas = hasil.rows[0].berat_diatas
                                    berat_dibawah = hasil.rows[0].berat_dibawah

                                    querystr = `SELECT ${berat} BETWEEN ${berat_dibawah} AND ${berat_diatas} AS brtt;`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                        if (hasil.rows.length == 0 || hasil.rows.length > 0 && hasil.rows[0].brtt == 0) {
                                            data = 'Kategori berat tidak sesuai! Pastikan kain memiliki kategori yang sama dengan kain awal yang di scan'
                                        } else {
                                            data = hasil.rows
                                        }
                                    })
                                }
                            })
                        } else {
                            data = hasil.rows
                        }
                    })
                }
            }
        })
    }
})
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fpenimbangan2 (v) gg
exports.penimbangan2 = async function(req, res){
    let data = []
    try {
        querystr = `SELECT vp.*, vs.berat_asal,IFNULL(a.keterangan,'') AS keterangan FROM v_penimbangan2 vp JOIN v_stokglobal vs USING(no_roll) LEFT JOIN a_batalhasiltimbang a ON no_roll=no_roll_asal ORDER BY berat_ditimbang ASC;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fpergantianbarcode (v) gg
exports.pergantian_barcode = async (req, res) => {
    let data = []
    let { no_roll, verifikasi, sistem, plastik, fisik, idKaryawan} = req.body;
    let rollbaru, tbl, kolom

    const bsistem = parseFloat(sistem) + parseFloat(plastik)
    const bfisik = parseFloat(fisik)

    try {
        if (no_roll.substring(0, 1).toUpperCase() != 'A') {
            data = 'No roll bukan kain pecahan'
        } else
        if (Math.abs(bsistem - bfisik) > 0.02) {
            data = 'Berat fisik harus sama dengan berat sistem'
        } else {
            querystr = `SELECT kode_roll FROM data_cabang LIMIT 1;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                rollbaru = hasil.rows[0].kode_roll
            })

            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `INSERT INTO n_pergantian_rollcabang VALUES(0,NOW(),'${no_roll}','${rollbaru}','${idKaryawan}')`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT * FROM s_tabelnoroll;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                tbl = hasil.rows[0].nama_tabel
                kolom = hasil.rows[0].nama_field

                querystr = `SELECT ${kolom} FROM ${tbl} WHERE '${kolom}'='${no_roll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length > 0) {
                        querystr = `UPDATE ${tbl} SET ${kolom}='${rollbaru}' WHERE ${kolom}='${no_roll}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()
                    } else {
                        data = hasil.rows;
                    }
                })
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fperinciankainstok (vtperincain tidak ada querynya) (?)
exports.perincian_kainstok = async (req, res) => {
    let data = []
    try {
        querystr = ``
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fpilihkain (v) gg
exports.pilih_kain = async (req, res) => {
    try {
        let data = []
        let { kode, no_roll, no_order } = req.body;
        if ( kode == '' || kode == undefined) {
            data = 'Kode Verifikasi Harus diisi!'
        } else {
            querystr = `SELECT * FROM  perincian_penerimaanstok WHERE no_roll='${no_roll}' AND kode='${kode}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'Kode verifikasi atau no roll salah!'
                } else {
                    querystr = `select * from penjualan_kainstok_temp where no_pengeluaran='${no_order}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows.length > 0) {
                            querystr = `SELECT * FROM pergantian_roll WHERE no_rollpengganti='${no_roll}' AND no_order='${no_order}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                if (hasil.rows.length == 0) {
                                    querystr = `SELECT * FROM perincian_pengeluaranstok_temp JOIN detail_pengeluaranstok_temp USING(no_detail) 
                                    WHERE no_roll='${no_roll}' AND no_pengeluaran='${no_order}';`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                        if (hasil.rows.length == 0) {
                                            data = 'Silahkan melakukan cetak faktur sementara terlebih dahulu'
                                        } else {
                                            data = hasil.rows
                                        }
                                    })
                                } else {
                                    data = hasil.rows
                                }
                            })
                        } else {
                            data = hasil.rows
                        }
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fpilihkainpengganti (v) gg
exports.pilih_kain_pengganti = async (req, res) => {
    try {
        let data = []
        querystr = `SELECT * FROM v_stokglobal WHERE berat < 1;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fpilihlokasidibawah1kg (v) gg
exports.pilih_lokasi_dibawah_1kg = async (req, res) => {
    let data = []
    let { lokasi, no_order } = req.body;
    try {
        if (lokasi == '' || lokasi == undefined) {
            data = 'Lokasi harus diisi!'
        } else {
            querystr = `SELECT no_lokasi FROM lokasi WHERE UPPER(no_lokasi)=UPPER(TRIM('${lokasi}'));`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'Lokasi tidak terdaftar di sistem!'
                } else {
                    querystr = `SELECT no_lokasi FROM n_lokasiorder_dibawah1kg WHERE no_order='${no_order}' AND no_lokasi <> '${lokasi}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows.length > 0) {
                            data = `Order ${no_order} sudah memiliki lokasi`
                        } else {
                            data = `Lokasi tujuan : ${lokasi}`
                        }
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fpotongkain (v) gg
exports.potong_kain = async (req, res) => {
    let data = []
    let { bakhir, no, kain, warna, vborder, no_order,idKaryawan } = req.body;
    let kurangorder, vnorolorder, vspkorder, nodetail15
    try {
        querystr = `UPDATE detail_order SET berat_ataujmlroll='${bakhir}'
        WHERE no_detail=(SELECT no_detail FROM perincian_order WHERE NO='${no}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `UPDATE perincian_order SET berat='${bakhir}' WHERE NO='${no}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        kurangorder = vborder - parseFloat(bakhir)

        querystr = `SELECT IFNULL(no_roll,'kosong') AS noroll,IFNULL(berat,'kosong') AS berat,IFNULL(kode,'kosong') AS kode FROM v_stokglobal_transfer 
        WHERE nama_kain='${kain}' AND jenis_warna='${warna}' HAVING berat >='${kurangorder}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            vnorolorder = hasil.rows[0].noroll
            vspkorder = hasil.rows[0].kode

            if (vnorolorder == '' || vnorolorder == undefined || vnorolorder == 'kosong') {
                data = 'Tidak ada kain yang bisa memenuhi kekurangan order tersebut silahkan hub admin!'
            } else {
                querystr = `INSERT INTO detail_order VALUES(0,'${no_order}','${kain}','${warna}','KGAN','${kurangorder}',0,'SIAP POTONG',0,'',0,'${vspkorder}');`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
                
                querystr = `select max(no_detail) as no from detail_order`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    nodetail15 = hasil.rows[0].no
                })
                
                querystr = `INSERT INTO perincian_order VALUES(0,'${vnorolorder}','${nodetail15}',0,'${kurangorder}',0,'${idKaryawan}',0,'','')`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
                data = 'Data berhasil di pecah order'
            }
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fscanid (v) gg
exports.scan_id = async (req, res) => {
    let data = []
    let { scan } = req.body;
    let viduser
    try {
        if (scan == '' || scan == undefined) {
            data = 'Silahkan scan ID terlebih dahulu!'
        } else {
            querystr = `SELECT id_user FROM n_supervisor WHERE id='${scan}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'ID tidak terdaftar!'
                } else {
                    viduser = hasil.rows[0].id_user
                    data = hasil.rows
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fstokopnamekg (V) gg
exports.stok_opname_kg = async (req, res) => {
    let data = []
    let tipe = ''
    let bplastik = 0
    let { no_roll, verifikasi, fisik, plastik } = req.body;
    try {
        if (no_roll == '' || no_roll == undefined) {
            data = 'No roll tidak boleh kosong!'
        } else if (verifikasi == '' || verifikasi == undefined) {
            data = 'Kode verifikasi tidak boleh kosong!'
        } else if (fisik == '' || fisik == undefined) {
            data = 'Berat fisik tidak boleh kosong!'
        } else if(fisik < 0) {
            data = 'Berat fisik tidak boleh kurang dari 0!'
        } else if (fisik > 27) {
            data = 'Berat fisik tidak boleh lebih dari 27 Kg!'
        } else {
            querystr = `SELECT tipe_kain FROM perincian_penerimaanstok JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) WHERE no_roll='${no_roll}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                tipe = hasil.rows[0].tipe_kain
                if (tipe == 'BODY' && fisik > 30) {
                    data = 'Untuk kain body beratnya tidak boleh melebihi 30 KG!'   
                } else if (tipe != 'BODY' && fisik > 20) {
                    data = 'Untuk kain Rib, Krah, Manset beratnya tidak boleh melebihi 20 KG!'
                } else {
                    querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${no_roll}' AND sts='ROLLAN';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows.length != 0) {
                            querystr = `SELECT * FROM perincian_pengeluaranstok WHERE no_roll='${no_roll}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                if (hasil.rows.length == 0) {
                                    data = 'Kain tersebut tidak boleh di stokopname karena belum ada penettoan!'
                                } else {
                                    data = hasil.rows;
                                }
                            })
                        } else {
                            querystr = `SELECT no_roll FROM penjualan_kainstok JOIN detail_pengeluaranstok USING(no_pengeluaran) JOIN perincian_pengeluaranstok USING(no_detail) 
                            WHERE (penjualan_melalui='TRANSAKSI' OR penjualan_melalui='PENJUALAN BS SEGEL') AND no_roll='${no_roll}';`
                            queryvalue = [];
                            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                if (hasil.rows.length > 0) {
                                    data = 'Kain tersebut sudah dijual!'
                                } else {
                                    data = 'DATA KOSONG!'
                                    // data = hasil.rows;
                                }
                            })
                        }
                    })
                }
            })
            if (plastik == 0 || plastik == '' || plastik == undefined) {
                bplastik = 0
            } else {
                bplastik = plastik
            }
            console.log(bplastik);
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

//fterimaretur (v) gg
exports.terima_retur = async (req, res) => {
    let data = []
    try {
        querystr = `SELECT no_roll,nama_kain,jenis_warna,berat,status_terima,kode_verifikasi,kode_spk FROM cetak_labelretur cl JOIN kain k USING(id_kain) JOIN warna w USING(id_warna) WHERE STATUS=1;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

exports.btn_terima_retur = async (req, res) => {
    let data = []
    let { troll, tverfikasi, tberat } = req.body;
    let statusterima, statusjual, nodetail, no, berat, noroll2, noterima, hargalama, berattimbang, brt;
    try {
        if (troll == '' || troll == undefined) {
            data = 'No rol harus diisi!'
        } else if (tverfikasi == '' || tverfikasi == undefined) {
            data = 'Kode verifikasi harus diisi!'
        } else if (tberat == '' || tberat == undefined) {
            data = 'Berat harus diisi!'
        } else if (parseFloat(tberat) == 0){
            data = 'Berat tidak boleh 0!'
        } else {
            querystr = `SELECT * FROM cetak_labelretur WHERE no_roll='${troll}' AND STATUS=1;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'No roll tidak terdaftar di data penerimaan retur!'
                } else {
                    querystr = `SELECT * FROM cetak_labelretur WHERE no_roll='${troll}' AND STATUS=1 AND kode_verifikasi='${tverfikasi}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows.length == 0) {
                            data = 'Kode verifikasi salah!'
                        } else {
                            statusterima = hasil.rows[0].status_terima
                            statusjual = hasil.rows[0].status_jual
                            nodetail = hasil.rows[0].no_detail
                            no = hasil.rows[0].no
                            berat = hasil.rows[0].berat
                            noroll2 = hasil.rows[0].no_roll
                            
                            querystr = `SELECT no_terima,dpr.harga FROM detail_penerimaanstok dp JOIN detail_returpenjualanstok dr ON dp.no_detail=dr.no_detail
                            JOIN detail_pengeluaranstok dpr ON dr.no_detailpenjualan=dpr.no_detail  WHERE dp.no_detail='${nodetail}';`
                            queryvalue = []
                            await tabel.queryDB(querystr,queryvalue).then(async function(hasil){
                                noterima = hasil.rows[0].no_terima
                                hargalama = hasil.rows[0].harga

                                berattimbang = parseFloat(berat)
                                querystr = `SELECT DATA FROM konstanta WHERE jenis='RETUR ROLLAN';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                    if (hasil.rows.length == 0) {
                                        data = 'RETUR ROLLAN tidak terdaftar di konstanta, silahkan hub bagian IT!'
                                    } else {
                                        if (statusterima == 'ROLLAN' && berattimbang <= parseFloat(hasil.rows[0])) {
                                            data = 'Jenis kain salah silahkan isi menjadi kgan!'
                                        } else {
                                            querystr = `SELECT roll_terima,(SELECT pps.berat FROM  detail_pengeluaranstok dp JOIN perincian_pengeluaranstok pps USIN (no_Detail) WHERE dp.no_pengeluaran=rts.no_pengeluaran AND pps.no_roll=pp.roll_awal ) AS brt FROM retur_penjualanstok rts JOIN detail_returpenjualanstok dpr ON dpr.no_terimaretur=rts.no_terimaretur JOIN perincian_penerimaanreturstok pp ON dpr.no_detail=pp.no_detailretur WHERE rts.no_terimaretur='${noterima}' AND roll_terima ='${noroll2}';`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                                if (hasil.rows.length > 0) {
                                                    brt = hasil.rows[0].brt
                                                    if (parseFloat(tberat) > (brt + 0.02)) {
                                                        data = `Transaksi tidak bisa dilanjutkan karena berat kain yang di retur lebih besar dari berat order (${parseFloat(brt)} Kg) !`
                                                    } else {
                                                        querystr = `SELECT DATA FROM konstanta WHERE jenis='VERIFIKASI SUPERVISOR';`
                                                        queryvalue = []
                                                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                                            if ((brt + 0.01) - parseFloat(tberat) >= parseFloat(hasil.rows[0])) {
                                                                querystr = `SELECT STATUS,berat FROM n_verifikasi WHERE no_roll='${noroll2}' AND keterangan='TERIMA RETUR' ORDER BY NO DESC LIMIT 1;`
                                                                queryvalue = []
                                                                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                                                    console.log(hasil);
                                                                    data = `TOBE CONTINUED..`
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            })
                        }
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }

}

// ftimbangdibawah1kg (v) gg
exports.timbang_dibawah_1kg = async (req, res) => {
    let data = []
    let { edit5, selisih, noroll, tsistem, idKaryawan } = req.body;
    let tanggal, vsverifikasi, bakhir, bplastik 
    try {
        if (edit5 == '' || edit5 == undefined) {
            data = 'Berat fisik tidak boleh kosong!'
        } else if (parseFloat(edit5) <= 0 || edit5 <= 0) {
            data = 'Berat fisik tidak boleh kurang dari sama dengan 0'
        } else if (edit5 > 27 || parseFloat(edit5) > 27) {
            data = 'Berat fisik tidak boleh lebih dari 27 KG!'
        } else {
            querystr = `SELECT DATE_FORMAT(CURDATE(),''%Y-%m-%d'') as tgl`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                tanggal = hasil.rows[0].tgl
            })

            querystr = `SELECT DATA FROM konstanta WHERE jenis='VERIFIKASI SUPERVISOR'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (Math.abs(selisih) >= parseFloat(hasil.rows[0].data)) {
                    vsverifikasi = 'SELISIH NETTO TIMBANG ULANG DIBAWAH 1KG'
                    querystr = `SELECT STATUS,berat FROM n_verifikasi 
                    WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}'  ORDER BY NO DESC LIMIT 1;`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows.length == 0 || hasil.rows[0].status == 2 || hasil.rows[0].status == '2' && parseFloat(hasil.rows[0].berat) != parseFloat(tsistem)) {
                            querystr = `INSERT INTO n_verifikasi VALUES(0,'${noroll}',NULL,'${tsistem}',
                            '${parseFloat(bakhir) - parseFloat(bplastik)}','${idKaryawan}',NULL,'${vsverifikasi}',NULL,NULL,0)`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                        } else if (hasil.rows[0].status == 1 || hasil.rows[0].status == '1') {
                            querystr = `UPDATE n_verifikasi SET STATUS=2 WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                        } else if (hasil.rows[0].status == 1 || hasil.rows[0].status == '1' || parseFloat(hasil.rows[0].berat) != parseFloat(tsistem)) {
                            querystr = `UPDATE n_verifikasi SET berat='${tsistem}',berat2='${parseFloat(bakhir) - parseFloat(bplastik)}'  
                            WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}' AND STATUS=0`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            data = 'ALLDONE'
                        }
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// ftimbangkain (v) gg
exports.timbang_kain = async (req, res) => {
    let data = []
    let {edit5, nokarung, bakhir, lnoroll, idKaryawan, lokasi} = req.body;
    let tanggal, berat_dibawah, berat_diatas, idkategori
    try {
        if (edit5 == '' || edit5 == undefined) {
            data = 'Berat fisik tidak boleh kosong'
        } else if (edit5 <= 0 || parseFloat(edit5) <= 0) {
            data = 'Berat fisik tidak boleh kurang dari sama dengan 0'
        } else if (edit5 > 27 || parseFloat(edit5) > 27) {
            data = 'Berat fisik tidak boleh lebih dari 27 KG!'
        } else {
            querystr = `SELECT DATE_FORMAT(CURDATE(),''%Y-%m-%d'') as tgl`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                tanggal = hasil.rows[0].tgl
            })

            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT berat_dibawah,berat_diatas FROM n_kategori_karung 
            JOIN n_kategori_karung_detail USING(no_karung) WHERE no_karung='${nokarung}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    querystr = `SELECT id,berat_dibawah,berat_diatas FROM s_kategori_berat_lelang 
                    WHERE UPPER(sts_kategori)='AKTIF' AND tanggal_efektif<=NOW() AND ${bakhir} BETWEEN berat_dibawah AND berat_diatas;`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows.length == 0) {
                            querystr = `ROLLBACK`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            data = 'Scan gagal, karena kain tidak masuk ke dalam kategori manapun'
                        } else {
                            idkategori = hasil.rows[0].idkategori
                            berat_dibawah = hasil.rows[0].berat_dibawah
                            berat_diatas = hasil.rows[0].berat_diatas

                            querystr = `UPDATE n_kategori_karung SET id_kategori='${idkategori}',berat_dibawah='${parseFloat(berat_dibawah)}',berat_diatas='${parseFloat(berat_diatas)}' WHERE no_karung='${nokarung}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            
                            querystr = `INSERT INTO n_kategori_karung_detail(no_karung,no_roll,berat,id_user) VALUES('${nokarung}','${lnoroll}','${bakhir}','${idKaryawan}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                        }
                    })
                } else {
                    berat_dibawah = hasil.rows[0].berat_dibawah
                    berat_diatas = hasil.rows[0].berat_diatas

                    querystr = `SELECT ${bakhir} BETWEEN ${parseFloat(berat_dibawah)} AND ${parseFloat(berat_diatas)} as beratt`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        if (hasil.rows.length == 0 || hasil.rows.length > 0 && hasil.rows[0].beratt == 0) {
                            querystr = `ROLLBACK`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            data = 'Kategori berat tidak sesuai! Pastikan kain memiliki kateogri yang sama dengan kain awal yang di scan!'
                        } else {
                            querystr = `SELECT id FROM n_kategori_karung_detail WHERE no_karung='${nokarung}' AND no_roll='${lnoroll}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                                if (hasil.rows.length == 0) {
                                    querystr = `INSERT INTO n_kategori_karung_detail(no_karung,no_roll,berat,id_user) 
                                    VALUES('${nokarung}','${lnoroll}','${bakhir}','${idKaryawan}')`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()
                                } else {
                                    querystr = `update perincian_penerimaanstok set no_lokasi='${lokasi}' where no_roll='${lnoroll}'`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()

                                    querystr = `INSERT INTO lama_dilokasi(no_roll,no_lokasi,tanggal_simpan,id_karyawan,berat) VALUES('${lnoroll}','${lokasi}',NOW(),'${idKaryawan}','${bakhir}')`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()
                                    
                                    querystr = `COMMIT`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()
                                    data = 'done'
                                }
                            })
                        }
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// ftimbangulangkain (V)
exports.timbang_ulang_kain = async (req, res) => {
    let data = []
    let { edit5, bakhir, lberat, lnokarung, lokasi, idKaryawan } = req.body;
    let tanggal, bsisa
    try {
        if (edit5 == '' || edit5 == undefined) {
            data = 'Berat fisik tidak boleh kosong'
        } else if (edit5 <= 0 || parseFloat(edit5) <= 0) {
            data = 'Berat fisik tidak boleh kurang dari sama dengan 0'
        } else {
            querystr = `SELECT DATE_FORMAT(CURDATE(),''%Y-%m-%d'') as tgl`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                tanggal = hasil.rows[0].tgl
            })

            bsisa = Math.abs(parseFloat(lberat)*2)/100

            if (parseFloat(edit5) >= parseFloat(lberat) - bsisa && parseFloat(edit5) <= parseFloat(lberat) + bsisa) {
                data = 'Gagal disimpan! Silahkan cek kembali isi karung, dan timbang ulang karung.'
            } else {
                querystr = `START TRANSACTION`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
                
                querystr = `INSERT INTO lokasi_selesai(no_transaksi,tanggal,jenis,no_lokasi,id_karyawan,STATUS)
                VALUES('${lnokarung}',NOW(),'KATEGORI KARUNG','${lokasi}','${idKaryawan}',0)`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `UPDATE n_kategori_karung SET STATUS=1 WHERE no_karung='${lnokarung}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `COMMIT`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
                data = 'INSERT, UPDATE DONE'
            }
        }
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// ftrackroll (v)
exports.track_roll_qpecah = async (req, res) => {
    let data = []
    try {
        querystr = `SELECT * FROM data_pecahroll d JOIN perincian_penerimaanstok p  ON p.no_roll=d.roll2 
        LEFT JOIN kain_catatan USING(no_roll) JOIN user USING(id_user);`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

exports.track_roll_qcustomer = async (req, res) => {
    let data = []
    try {
        querystr = `SELECT *,(CASE penjualan_melalui WHEN 'TRANSAKSI' THEN 'PENJUALAN' ELSE penjualan_melalui END) AS jenis_transaksi,
        (CASE penjualan_melalui WHEN 'TRANSAKSI' THEN c.nama ELSE '-' END) AS customer FROM perincian_pengeluaranstok p 
        JOIN detail_pengeluaranstok dp USING(no_detail)
        JOIN penjualan_kainstok pj USING(no_pengeluaran) JOIN customer c USING(id_customer) JOIN USER USING(id_user);`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            data = hasil.rows;
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fupdatekain (v)
exports.update_kain = async (req, res) => {
    let data = []
    let { no_roll3, kode } = req.body;
    let nama_kain, warna, basli, border, beratfix, bookingblmscan;
    try {
        querystr = `SELECT * FROM perincian_penerimaanstok
        WHERE no_roll='${no_roll3}' AND kode='${kode}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
            if (hasil.rows.length == 0) {
                data = 'Kode verifikasi salah!'
            } else {
                querystr = `SELECT nama_kain,jenis_warna,berat_asal,b_order,berat FROM v_stokglobal_transfer 
                WHERE no_roll='${no_roll3}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                    if (hasil.rows.length == 0) {
                        data = 'Kain tidak terdaftar di sistem!'
                    } else {
                        nama_kain = hasil.rows[0].nama_kain
                        warna = hasil.rows[0].jenis_warna

                        basli = hasil.rows[0].berat_asal
                        border = hasil.rows[0].b_order
                        beratfix = hasil.rows[0].berat

                        querystr = `SELECT jenis_kain,warna,IFNULL(SUM(berat_ataujmlroll),0) AS jmlroll 
                        FROM detail_order LEFT JOIN perincian_order po USING(no_Detail) 
                        WHERE jenis_kain='${nama_kain}' AND warna='${warna}'
                        AND po.no_detail IS NULL GROUP BY jenis_kain,warna;`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                            if (hasil.rows.length > 0) {
                                bookingblmscan = hasil.rows[0].jmlroll
                                data = hasil.rows
                            } else {
                                bookingblmscan = 0
                                data = 'Data empty!'
                            }
                        })
                    }
                })
            }
        })
        response.ok(data, 200, res)
    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// fverifikasikain (v) gg
exports.verifikasi_kain = async (req, res) => {
    try {
        let data = []
        let { kode, no_roll, no_karung } = req.body;
        if ( kode == '' || kode == undefined) {
            data = 'Kode Verifikasi Harus diisi!'
        } else {
            querystr = `SELECT * FROM  perincian_penerimaanstok WHERE no_roll='${no_roll}' AND kode='${kode}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                if (hasil.rows.length == 0) {
                    data = 'Kode verifikasi atau no roll salah!'
                } else {
                    querystr = `SELECT id FROM n_kategori_karung_detail WHERE no_karung='${no_karung}' AND no_roll='${no_roll}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                        // console.log(hasil.rows[0].id);
                    if (hasil.rows.length > 0) {
                        querystr = `delete from n_kategori_karung_detail where id=${hasil.rows.id}`
                        queryvalue = []
                         await tabel.queryDB(querystr, queryvalue).then(async function(hasil){
                             data = 'Berhasil dibatalkan' + '==' + hasil.rows
                         })
                    }
                    })
                }
            })
        }
        response.ok(data, 200, res)
    } catch (error) {
        console.log(error);
        response.ok(tabel.GetError(error), 301,res)
    }
}

// PENIMBANGAN