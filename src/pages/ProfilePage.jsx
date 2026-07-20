import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileImageForm from "../components/profile/ProfileImageForm";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
//import SuccessMessage from "../components/common/SuccessMessage";
import { showSuccessToast, showErrorToast } from "../utils/toast";


import { profileService } from "../features/profile/profileService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useAuth } from "../features/auth/AuthContext";

function extractProfile(result) {
  if (result.data?._id) {
    return result.data;
  }

  if (result.data?.user?._id) {
    return result.data.user;
  }

  if (result.user?._id) {
    return result.user;
  }

  return null;
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  //const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleUnauthorized(error) {
    if (error.response?.status === 401) {
      logout();
      navigate("/login");
      return true;
    }

    return false;
  }

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const result = await profileService.getProfile();
      const profileFromBackend = extractProfile(result);

      if (!profileFromBackend) {
        setError("Profile response format was unexpected");
        return;
      }

      setProfile(profileFromBackend);
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setError(getErrorMessage(error, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  
  async function handleUploadProfilePicture(formData) {
  try {
    setUploadLoading(true);
    setError("");
    //setSuccessMessage("");

    const result = await profileService.uploadProfilePicture(formData);
    const updatedProfile = extractProfile(result);

    if (!updatedProfile) {
      setError("Profile picture uploaded but response format was unexpected");
      return false;
    }

    setProfile(updatedProfile);
    //setSuccessMessage("Profile picture uploaded successfully");
    showSuccessToast(result.message || "Profile picture uploaded successfully");
    return true;
  } catch (error) {
    if (handleUnauthorized(error)) return false;

    const message=getErrorMessage(error, "Failed to upload profile picture");
    setError(message);
    showErrorToast(message);
    return false;
  } finally {
    setUploadLoading(false);
  }
}
  

  async function handleDeleteProfilePicture() {
  try {
    setDeleteLoading(true);
    setError("");

    const result = await profileService.deleteProfilePicture();

    const updatedProfile = extractProfile(result);

    if (updatedProfile) {
      setProfile(updatedProfile);
    } else {
      await fetchProfile();
    }

    showSuccessToast(result.message || "Profile picture deleted successfully");
  } catch (error) {
    if (handleUnauthorized(error)) return;

    const message = getErrorMessage(error, "Failed to delete profile picture");
    setError(message);
    showErrorToast(message);
  } finally {
    setDeleteLoading(false);
  }
}


  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  return (
    <div>
      <div className="page-header">
  <div>
    <h1>Profile</h1>
    <p>Manage your account details and profile picture.</p>
  </div>
</div>

      <ErrorMessage message={error} />

  {profile ? (
  <div className="profile-grid">
    <div className="card profile-card">
      <div className="profile-image-wrapper">
        {profile.profilePicture?.url ? (
          <img
            src={profile.profilePicture.url}
            alt={profile.name || "Profile"}
            className="profile-image"
          />
        ) : (
          <div className="profile-placeholder">
            {profile.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>

      <h2>{profile.name}</h2>
      <p>{profile.email}</p>

      {profile.profilePicture?.url && (
        <Button
          type="button"
          disabled={deleteLoading}
          onClick={handleDeleteProfilePicture}
          className="btn-danger"
        >
          {deleteLoading ? "Deleting..." : "Delete Profile Picture"}
        </Button>
      )}
    </div>

    <div className="card">
      <ProfileImageForm
        onUploadProfilePicture={handleUploadProfilePicture}
        loading={uploadLoading}
      />
    </div>
  </div>
) : (
  <p>Profile not found</p>
)}
</div>
);}

export default ProfilePage;