import { apiMethods } from '../../utils/api';
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Notifications,
  Security,
  School,
  Work,
} from '@mui/icons-material';
import { Formik, Form, Field, type FormikHelpers } from 'formik';
import { useAuth } from '../../hooks/useAuth';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { profileUpdateSchema } from '../../utils/validation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProfilePage: React.FC = () => {
  const { user, isTalent, isUniversityStaff, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = async (
  values: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    bio: string;
    birth: string;
    location: string;
  },
  { setSubmitting }: FormikHelpers<typeof values>
) => {
  const payload = new FormData();

  // text fields
  Object.entries(values).forEach(([k, v]) => payload.append(k, v));

  // avatar from state
  const fileInput = document.querySelector<HTMLInputElement>(
    'input[type="file"][accept="image/*"]'
  );
  if (fileInput?.files?.[0]) payload.append('profile_image', fileInput.files[0]);

  try {
    await apiMethods.patch('/users/profile/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('✅ Profile saved');
  } catch (err: any) {
    alert(err?.response?.data?.detail || '❌ Could not save profile');
  } finally {
    setSubmitting(false);
    setIsEditing(false);
  }
};

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return <Alert severity="error">User not found</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Button
          variant={isEditing ? "outlined" : "contained"}
          startIcon={isEditing ? <Cancel /> : <Edit />}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>

      {/* Profile Header Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Box position="relative">
            <Avatar
              src={profileImage || undefined}
              sx={{ width: 100, height: 100 }}
            >
              {user.first_name?.[0]}{user.last_name?.[0]}
            </Avatar>
            {isEditing && (
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
                size="small"
              >
                <Edit fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </IconButton>
            )}
          </Box>
          
          <Box flexGrow={1}>
            <Typography variant="h5" gutterBottom>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box display="flex" gap={1}>
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.5,
                  bgcolor: 'primary.100',
                  color: 'primary.main',
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                }}
              >
                {(user.user_type || '').replace('_', ' ')}
              </Typography>
              {user.is_active && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.5,
                    bgcolor: 'success.100',
                    color: 'success.main',
                    borderRadius: 1,
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                  }}
                >
                  Active
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Notifications />} label="Preferences" />
          <Tab icon={<Security />} label="Security" />
          {(isUniversityStaff || isAdmin) && (
            <Tab icon={<School />} label="University" />
          )}
          {isTalent && (
            <Tab icon={<Work />} label="Professional" />
          )}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Paper sx={{ p: 3 }}>
        {/* Personal Information */}
        <TabPanel value={activeTab} index={0}>
          <Formik
            initialValues={{
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              email: user.email || '',
              phone_number: user.phone_number || '',
              bio: user.bio || '',
              birth: user.birth || '',
              location: user.location || '',
            }}
            validationSchema={profileUpdateSchema}
            onSubmit={handleProfileUpdate}
          >
            {({ errors, touched, values, setFieldValue, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="first_name"
                      label="First Name"
                      disabled={!isEditing}
                      error={touched.first_name && !!errors.first_name}
                      helperText={touched.first_name && errors.first_name}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="last_name"
                      label="Last Name"
                      disabled={!isEditing}
                      error={touched.last_name && !!errors.last_name}
                      helperText={touched.last_name && errors.last_name}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="email"
                      label="Email"
                      type="email"
                      disabled={!isEditing}
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="phone_number"
                      label="Phone Number"
                      disabled={!isEditing}
                      error={touched.phone_number && !!errors.phone_number}
                      helperText={touched.phone_number && errors.phone_number}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="birth"
                      label="Date of Birth"
                      type="date"
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                      error={touched.birth && !!errors.birth}
                      helperText={touched.birth && errors.birth}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="location"
                      label="Location"
                      disabled={!isEditing}
                      error={touched.location && !!errors.location}
                      helperText={touched.location && errors.location}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Bio
                    </Typography>
                    <RichTextEditor
                      content={values.bio}
                      onChange={(content) => setFieldValue('bio', content)}
                      placeholder="Tell us about yourself..."
                      disabled={!isEditing}
                      minHeight={120}
                    />
                  </Grid>

                  {isEditing && (
                    <Grid item xs={12}>
                      <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={isSubmitting}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Form>
            )}
          </Formik>
        </TabPanel>

        {/* Preferences */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email notifications for new appointments"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email notifications for appointment confirmations"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email notifications for appointment cancellations"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch />}
                label="SMS notifications (if phone number provided)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Reminder notifications 24 hours before appointments"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Calendar Preferences
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Default Calendar View"
                defaultValue="month"
                SelectProps={{ native: true }}
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Time Zone"
                defaultValue="UTC"
                SelectProps={{ native: true }}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </TextField>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                placeholder="Enter new password"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary">
                Update Password
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Two-Factor Authentication
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Two-factor authentication adds an extra layer of security to your account.
          </Alert>
          
          <FormControlLabel
            control={<Switch />}
            label="Enable Two-Factor Authentication"
          />
        </TabPanel>

        {/* University Info (for staff/admin) */}
        {(isUniversityStaff || isAdmin) && (
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              University Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="University"
                  value={user.university?.name || 'Not assigned'}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  placeholder="e.g., Computer Science"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position/Title"
                  placeholder="e.g., Career Counselor"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Office Location"
                  placeholder="e.g., Building A, Room 101"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Specializations"
                  placeholder="Describe your areas of expertise..."
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </TabPanel>
        )}

        {/* Professional Info (for talents) */}
        {isTalent && (
          <TabPanel value={activeTab} index={isUniversityStaff || isAdmin ? 4 : 3}>
            <Typography variant="h6" gutterBottom>
              Professional Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Status"
                  select
                  defaultValue="student"
                  disabled={!isEditing}
                  SelectProps={{ native: true }}
                >
                  <option value="student">Student</option>
                  <option value="recent_graduate">Recent Graduate</option>
                  <option value="job_seeker">Job Seeker</option>
                  <option value="employed">Employed</option>
                  <option value="entrepreneur">Entrepreneur</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Field of Interest"
                  placeholder="e.g., Software Engineering"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Experience Level"
                  select
                  defaultValue="entry"
                  disabled={!isEditing}
                  SelectProps={{ native: true }}
                >
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior (1-3 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn Profile"
                  placeholder="https://linkedin.com/in/yourprofile"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Career Goals"
                  placeholder="Describe your career aspirations..."
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Skills"
                  placeholder="List your key skills and technologies..."
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
  
};

