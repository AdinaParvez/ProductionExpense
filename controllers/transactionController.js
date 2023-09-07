const transactionModel = require('../models/transactionModel')
const moment = require('moment')
// Import xlsx library at the top of your server-side code
const xlsx = require('xlsx');
const XLSXStyle = require("xlsx-style");

const getAllTransaction = async(req, res) => {
   try{
       const {frequency, selectedDate, type} = req.body
       const transactions = await transactionModel.find({
          ...(frequency !== 'custom' ? {
            date:{
                $gt: moment().subtract(Number(frequency), 'd').toDate()
            },
          } : {
            date:{
                $gte: selectedDate[0],
                $lte: selectedDate[1]
            }
          }),
          userid: req.body.userid,
          ...(type !== 'all' && {type})
        })
       res.status(200).json(transactions)
   }catch(error){
    console.log(error)
    res.status(500).json(error)
   }
}


const addTransaction = async(req, res) => {
    try{
        const newTransaction = new transactionModel(req.body)
        await newTransaction.save()
        res.status(201).send('Transaction created')
    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
}


const editTransaction = async(req,res) => {
  try{
    await transactionModel.findOneAndUpdate(
        { _id: req.body.transactionId },
        req.body.payload
    )
    res.status(200).send('Edit Successfully!')
  }catch(error){
    console.log(error)
    res.status(500).json(error)
  }
}

const deleteTransaction = async(req,res) => {
  try{
    await transactionModel.findOneAndDelete({_id:req.body.transactionId})
    res.status(200).send('Delete Successfully!')
  }catch(error){
    console.log(error)
    res.status(500).json(error)
  }
}


// Controller function for uploading Excel data
const uploadExcelTransaction = async (req, res) => {
  try {
   //Read the excel file from path
    let xlFile = xlsx.readFile('C:\\Users\\LENOVO\\Desktop\\ExpenseSheet.xlsx')
    //Extract the data in a sheet
    let sheet = xlFile.Sheets[xlFile.SheetNames[0]]
    //Convert sheet into json
    let P_JSON = xlsx.utils.sheet_to_json(sheet)
    await transactionModel.insertMany(P_JSON).then((result)=>{
      if(result.length>0){
        res.status(200).send('Data saved successfully from excel')
        console.log(result.length)
      }else{
        res.send(new ErrResponse(201, 'Data is not present'))
      }

    })
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to save data to MongoDB', error: error.message });
  }
}



const dowloadExcelTransaction = async(req, res) => {
  try{
    
       await transactionModel.find({},{amount:1, type:1, category:1, reference:1, description:1, date:1,  _id:0}).then((result) => {
       if (result.length > 0) {
           
          const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
          const fileName = `TransactionDetail_${timestamp}.xlsx`;

           let response = JSON.parse(JSON.stringify(result))
           //Create workbook
           let workbook = xlsx.utils.book_new()


           
           //converts json array to worksheet
           let worksheet = xlsx.utils.json_to_sheet(response)


           worksheet.A1.v = 'Amount'
           worksheet.B1.v = 'Type'
           worksheet.C1.v='Category'
           worksheet.D1.v='Reference'
           worksheet.E1.v='Description'
           worksheet.F1.v='Date'


            // Define the date format for the "Date" column (assuming it's the 6th column, 0-based index)
            worksheet["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }];

            worksheet["!autofilter"] = { ref: "A1:F1" }; // Enable autofilter for the header row

            
                      //Append a worksheet to workbook
           xlsx.utils.book_append_sheet(workbook, worksheet, 'Transactions');

          //  xlsx.writeFile(workbook, `C:\\Downloads\\${fileName}`);
           xlsx.writeFile(workbook, `downloads/${fileName}`);
           res.status(200).send('Data exported to excel');
          } else {
            res.status(404).send('No data available');
        }
       })
        
     }catch(error){
           console.log(error)
           res.status(500).json({ message: 'Failed to export data to Excel', error: error.message });
     }
    
}



module.exports = {
  getAllTransaction, 
  addTransaction, 
  editTransaction, 
  deleteTransaction, 
  uploadExcelTransaction,
  dowloadExcelTransaction
}

