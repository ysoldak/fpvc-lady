import * as React from 'react'

import { txt } from '../locale/locale.js'

import Grid from '@mui/material/Unstable_Grid2/index.js'
import Button from '@mui/material/Button/index.js'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'


function ConfirmModal(props) {

  function closeModal() {
    props.setConfirmModal({...props.confirmModal, show: false})
  }

  function callCallBack() {
    if (props.confirmModal.callBack) {
      props.confirmModal.callBack()
    }
    closeModal()
  }
  
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'black',
    border: '2px solid #009400',
    boxShadow: 24,
    p: 4,
  }

  return (
    <Modal open={props.confirmModal.show}>
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {props.confirmModal.title}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2, mb: 3 }} className="fpvcm-modal-contents">
          {props.confirmModal.contents}
        </Typography>
        <Grid container spacing={2}>
          <Grid xl={6} lg={6} md={6} sm={6} xs={6} className="mt-2">
            <Button variant="contained" size="small" className="fpvcm-modal-btn" onClick={() => callCallBack()}> 
              {txt('yes', props.lang)}
            </Button>
          </Grid>
          <Grid xl={6} lg={6} md={6} sm={6} xs={6}>
            <Button variant="contained" size="small" className="fpvcm-modal-btn cancel-btn" onClick={closeModal}> 
              {txt('cancel', props.lang)}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

export default ConfirmModal;