
export const columns =[
    {
      name: "S No"  ,
      selector: (row) => row.sno,
      width: "90px"
    }, //obj
    {
        name: "Name"  ,
        selector: (row) => row.resident_name,
        sortable: true
    },
    {
        name: "Image"  ,
        selector: (row) => row.profileImage,
        width: "90px"
    },
    {
        name: "Type",
        selector: (row) => row.typeOfUser ,
        width: "110px",
    },
    {
        name: "Apartment"  ,
        selector: (row) => row.resident_apartment,
        sortable: true
    },
    {
        name: "Status"  ,
        selector: (row) => row.type,
        sortable: true
    },
    {
        name: "Scan Date",
        selector: (row) => row.scan_date,
    },
    {
        name: "Scan Time",
        selector: (row) => row.scan_time
    },

]