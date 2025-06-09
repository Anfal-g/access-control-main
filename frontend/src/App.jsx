import {BrowserRouter, Routes ,Route, Navigate} from 'react-router-dom'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ResidentDashboard from './pages/ResidentDashboard.jsx'
import PrivateRoutes from './utils/PrivateRoutes.jsx';
import RoleBasedRoutes from './utils/RoleBasedRoutes.jsx'
import AdminSummary from './components/dashboard/AdminSummary.jsx';
import ApartementList from './components/apartment/ApartmentList.jsx';
import AddApartement from './components/apartment/AddApartment.jsx';
import EditApartment from './components/apartment/EditApartment.jsx';
import ResidentList from './components/resident/List.jsx'
import AddResident from './components/resident/Add.jsx'
import View from './components/resident/View.jsx'
import Edit from './components/resident/Edit.jsx'
import Summary from './components/ResidentDashboard/Summary.jsx';
import Setting from './components/ResidentDashboard/Setting.jsx';
import AdminSetting from './components/dashboard/Setting.jsx';
import Contact from './components/ResidentDashboard/Contact.jsx';
import AdminContact from './components/dashboard/Contact.jsx';
import Building from './components/dashboard/Building.jsx';
import AdminReply from './components/dashboard/AdminReply.jsx'
import Notifications from './components/ResidentDashboard/Notification.jsx';
import QRScanner from './pages/QRScanner.jsx';
import QRScannerLeave from './pages/QRScannerLeave.jsx';
import EntryLogs from './components/dashboard/EntryLogs.jsx';
import BlockResident from './components/resident/Block.jsx';
import BlockList from './components/dashboard/BlockList.jsx';
import VisitorList from './components/visitor/List.jsx';
import AddVisitor from './components/visitor/Add.jsx';
import BlockVisitor from './components/visitor/Block.jsx';
import AdminResidentList from './components/visitor/AdminResidentList.jsx';
import AdminAddVisitor from './components/visitor/AdminAdd.jsx';
import VisitRequest from './components/dashboard/VisitRequest.jsx';
import RequestsList from './components/ResidentDashboard/RequestsList.jsx';
import RequestView from './components/ResidentDashboard/RequestView.jsx';
import ListRequests from './components/dashboard/RequestsList.jsx';
import TelegramSender from './pages/TelegramSender.jsx';
import Form from './pages/Form.jsx';
import VisitorEdit from './components/visitor/Edit.jsx';
import Messages from './components/ResidentDashboard/Messages.jsx';
import AdminNotifications from './components/dashboard/Notification.jsx'
import AdminMessages from './components/dashboard/Messages.jsx'




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <Navigate to={"/admin-dashboard"}/> }></Route>
        <Route path='/login' element={ <Login/>}></Route>
        <Route path='/qrscanner' element={<QRScanner/>}/>
        <Route path='/qrscannerleave' element={<QRScannerLeave/>}/>
        <Route path='/telegrem' element={<TelegramSender/>}/>
        <Route path='/form' element={<Form/>}/>
        <Route path='/test' element={<h1>Hello omayma</h1>}/>


        <Route path='/admin-dashboard' element={ 
          //will check if the user logged in or not
          <PrivateRoutes> 
            <RoleBasedRoutes requiredRole={"admin"}> {/* if it's loged in we will check the role + pass an array */}
              <AdminDashboard/> {/* AdminDashboard is accessible only for admin */}
            </RoleBasedRoutes> 
          </PrivateRoutes>
        }>
          {/* whenever we moved to admin dash this will display */}
          <Route index element={<AdminSummary/>}></Route>
          <Route path='/admin-dashboard/apartments' element={<ApartementList/>}></Route> 
          <Route path='/admin-dashboard/add-apartment' element={<AddApartement/>}></Route> 
          <Route path='/admin-dashboard/apartment/:id' element={<EditApartment/>}></Route>

          <Route path='/admin-dashboard/residents' element={<ResidentList/>}></Route> 
          <Route path='/admin-dashboard/add-resident' element={<AddResident/>}></Route>
          <Route path='/admin-dashboard/residents/:id' element={<View/>}></Route>
          <Route path='/admin-dashboard/residents/edit/:id' element={<Edit/>}></Route>
          <Route path='/admin-dashboard/residents/block/:id' element={<BlockResident/>}></Route>
          <Route path='/admin-dashboard/residents/visitors/:id' element={<AdminResidentList/>}></Route>
          <Route path='/admin-dashboard/visitors/block/:id' element={<BlockVisitor/>}></Route>
          <Route path='/admin-dashboard/visitors/edit/:id' element={<VisitorEdit/>}></Route>
          {/* <Route path='/admin-dashboard/add-visitor' element={<AdminAddVisitor/>}></Route> */}
          <Route path="/admin-dashboard/residents/:id/add-visitor" element={<AdminAddVisitor />} />

          <Route path='/admin-dashboard/setting' element={<AdminSetting/>}/>
          <Route path='/admin-dashboard/contact' element={<AdminContact/>}/>
          <Route path='/admin-dashboard/contact/reply/:id' element={<AdminReply/>}/>
          <Route path='/admin-dashboard/building' element={<Building/>}/>
          <Route path='/admin-dashboard/entrylogs' element={<EntryLogs/>}/>
          <Route path='/admin-dashboard/blocklist' element={<BlockList/>}/>
          <Route path='/admin-dashboard/request' element={<VisitRequest/>}/>
          <Route path='/admin-dashboard/requests' element={<ListRequests/>}/>
          <Route path='/admin-dashboard/requests/view/:id' element={<RequestView/>}/>
          <Route path='/admin-dashboard/notifications' element={<AdminNotifications/>}/>
          <Route path='/admin-dashboard/messages' element={<AdminMessages/>}/>

        </Route>

        <Route path='/resident-dashboard' element={ 
            <PrivateRoutes>
              <RoleBasedRoutes requiredRole={["admin","resident"]}>
                <ResidentDashboard/>
              </RoleBasedRoutes> 
            </PrivateRoutes>
        }>
          <Route index element={<Summary/>}></Route>
          <Route path='/resident-dashboard/profile/:id' element={<View/>}/>

          <Route path='/resident-dashboard/setting' element={<Setting/>}/>
          <Route path='/resident-dashboard/contact' element={<Contact/>}/>
          <Route path='/resident-dashboard/notifications' element={<Notifications/>}/>
          <Route path='/resident-dashboard/messages' element={<Messages/>}/>

          <Route path='/resident-dashboard/visitors/:id' element={<VisitorList/>}/>
          <Route path='/resident-dashboard/add-visitor' element={<AddVisitor/>}></Route>
          <Route path='/resident-dashboard/visitors/block/:id' element={<BlockVisitor/>}></Route>
          <Route path='/resident-dashboard/visitors/edit/:id' element={<VisitorEdit/>}></Route>
          <Route path='/resident-dashboard/requests/:id' element={<RequestsList/>}/>
          <Route path='/resident-dashboard/requests/view/:id' element={<RequestView/>}/>




        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
