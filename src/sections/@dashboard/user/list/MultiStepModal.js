/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
// React
import React, { useState } from 'react';
// mui
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Divider,
  Chip,
  Box,
} from '@mui/material';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { useSettingsContext } from '../../../../components/settings';
// paths
import { PATH_AUTH } from '../../../../routes/paths';
import { BASE_URL } from '../../../../config';
// api and auth
import axios from '../../../../utils/axios';
import { useAuthContext } from '../../../../auth/useAuthContext';
// assets
import { admin } from '../../../../_mock/assets/admin';
// ----------------------------------------------------------------------

MultiStepModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

// ----------------------------------------------------------------------
export default function MultiStepModal({ open, onClose }) {
  const { user, setTeamAndRoleInUser } = useAuthContext();
  const { themeMode } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [emails, setEmails] = useState([]);
  
  const isLight = themeMode === 'light';

  const handleNext = () => {
    if (page === 1) {
      if (companyName.trim() === '') {
        enqueueSnackbar('Company Name is required!', { variant: 'error' });
        return;
      }

    } else if (page === 2) {
      if (role.trim() === '') {
        enqueueSnackbar('Role is required!', { variant: 'error' });
        return;
      }
    } 
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevious = () => {
    setPage((prevPage) => prevPage - 1);
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleCreateTeam = async () => {
    try {
      const ownerRole = role === 'other' ? customRole : role;

      const response = await axios.post('/teams', {
        companyName,
        ownerRole,
        ownerId: user.uid,
        ownerEmail: user.email,
        shared: emails, 
        invitationLink: BASE_URL + PATH_AUTH.register, 
      });

      if (response.status === 201) {
        const teamId = response.data?.team._id;
        const company = response.data?.team.companyName;
        const type = response.data?.team.ownerType;

        if (response.data && response.data?.inviteSend) {
          enqueueSnackbar('Team created and invites sent!');          
        } else {
          enqueueSnackbar('Team Created!');
        }

        await setTeamAndRoleInUser(teamId, ownerRole, company, type);        
        onClose();  
      } 
      else if (response.status === 400 && response.data?.error === 'Company Name already exists') {
        enqueueSnackbar(response.data?.error, { variant: 'error' });
      } 
      else {
        enqueueSnackbar('Failed to create team. Please try again!', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddEmailTag = (event) => {
    if (event.key === 'Enter' && event.target.value.trim() !== '') {
      const newEmail = event.target.value.trim();
      setEmails((prevEmails) => [...prevEmails, newEmail]);
      event.target.value = ''; // Clear the input field after adding the email as a tag
    }
  };

  const handleRemoveEmailTag = (index) => {
    setEmails((prevEmails) => prevEmails.filter((_, i) => i !== index));
  };

  const steps = [
    { index: 0, title: `Welcome, ${user?.displayName ? user.displayName.split(" ")[0] : ""}! Let's build out your team.`, subtitle: 'Enter your company details to reserve a URL' },
    { index: 1, title: 'Choose Your Role', subtitle: 'Select your role within the team' },
    { index: 2, title: 'Enter Emails', subtitle: 'Add team members using their email addresses' },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <div>
          <div>{steps[page - 1].title}</div>
          <Typography variant='body2' sx={{ color: '#637381', fontSize: '14px', fontWeight: '400', lineHeight: '22px', gap: '4px', marginTop: '2px' }}>
            {steps[page - 1].subtitle}
          </Typography>
        </div>
        <Divider sx={{ my: 2 }} />
        <div style={{ display: 'flex', justifyContent: "space-between", alignItems: 'center' }}>
          {steps.map(step => (
            <React.Fragment key={step.index}>
              {step.index > 0 && (
                <svg height="24" width="30" style={{ margin: '0 6px' }}>
                  <line x1="0" y1="12" x2="20" y2="12" stroke='#DFE8F6' strokeWidth="2" />
                </svg>
              )}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: `1px solid ${step?.index === page - 1 ? '#4CAF50' : '#DFE8F6'}`,
                  background: `${step?.index === page - 1 ? '#EBFFF5' : step?.index < page - 1 ? '#00AB55' : 'white'}`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '14px', color: step?.index === page - 1 ? '#4CAF50' : step?.index < page - 1 ? 'white' : '#848FAC' }}>
                  {step.index + 1}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </DialogTitle>
      <DialogContent>
        {page === 1 && (
          <TextField
            fullWidth
            placeholder='Company Name'
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        )}
        {page === 2 && (
          <Box>
            <TextField
              fullWidth
              select
              label='Which best describes your role?'
              placeholder='Which best describes your role?'
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{ my: 2 }}
            >
              {admin && !!admin.length && admin.map((adminRole, idx) => (
                <MenuItem key={idx} value={adminRole}>{adminRole}</MenuItem>
              ))}
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            {role === 'other' && (
              <TextField
                fullWidth
                label="Enter your custom role"
                placeholder="Enter your custom role"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
              />
            )}
          </Box>
        )}
        {page === 3 && (
          <Stack spacing={1}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Invite team-members"
                onKeyDown={handleAddEmailTag}
            />
            {/* Show added email tags inside the TextField */}
            {emails.map((email, index) => (
              <Chip
                key={index}
                label={email}
                onDelete={() => handleRemoveEmailTag(index)}
                style={{ margin: '4px' }}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: page === 1 ? 'flex-end' : 'space-between' }}>
        {page > 1 && page < steps.length && (
          <Button onClick={handleSkip} size='small' style={{ color: isLight ? 'black' : 'white' }}>
            Skip
          </Button>
        )}
        <div>
          {page > 1 && (
            <Button
              variant="outlined"
              onClick={handlePrevious}
              style={{ color: isLight ? 'black' : 'white', borderColor: '#919EAB52', marginRight: '1rem'  }}
            >
              Previous
            </Button>
          )}
          {
            page < steps.length && (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )
          }
        </div>
        {
          page === steps.length && (
            <Button
              variant="contained"
              onClick={handleCreateTeam}
            >
              Create Team
            </Button>
          )
        }
      </DialogActions>
    </Dialog>
  );
};
