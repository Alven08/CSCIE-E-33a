// function App() {
//     const [vendorChecked, setVendorChecked] = React.useState(false);
//     const [vendorName, setVendorName] = React.useState(null);
//
//     return (
//         <div>
//             <div class="form-group">
//                 <input class="vendor-input" type="checkbox" name="vendor" checked={vendorChecked}
//                     onChange={(e) => setVendorChecked(e.target.checked)} />
//                 <label class="m-b-0 form-check-label" for="vendor">Are you a vendor?</label>
//             </div>
//
//             {vendorChecked &&
//                 <div class="form-group">
//                     <input className="form-control" type="text" name="vendor_name" placeholder="Vendor Name"
//                            value={vendorName}
//                            onChange={(e) =>  setVendorChecked(e.target.value)}/>
//                 </div>
//             }
//         </div>
//     );
// }
//
// ReactDOM.render(<App/>, document.querySelector("#vendor-inputs"));

function changeVendorCheckbox(target) {
    const vendor_name_input = document.querySelector('#vendor-name');
    if (target.checked == true)
        vendor_name_input.style.display = "block";
    else
        vendor_name_input.style.display = "none";
}


