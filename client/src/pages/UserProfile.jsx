import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import API from './components/axios.js'
import { FaEdit } from 'react-icons/fa'
import { UserContext } from './components/context/userContext'
import PostItem from './components/PostItem'
import usePostStream from './components/usePostStream'
import Loader from './components/Loader'

const scrollTop = () => window.scrollTo(0, 0)

const resolveMediaUrl = (path, folder = 'mern') => {
  const assetsBase = import.meta.env.VITE_API_ASSETS_URL
  if (!path || path.includes('placeholder'))
    return `${assetsBase}/${folder}/post-placeholder.png`
  if (path.startsWith('http')) return path
  const cleanPath = path.startsWith(`${folder}/`) ? path : `${folder}/${path}`
  return `${assetsBase}/${cleanPath}`
}

const UserProfile = () => {
  const { id }                                      = useParams()
  const [userData, setUserData]                     = useState(null)
  const [loading, setLoading]                       = useState(true)
  const [error, setError]                           = useState('')
  const [isEditing, setIsEditing]                   = useState(false)
  const [isLoading, setIsLoading]                   = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [avatar, setAvatar]                         = useState(null)
  const [avatarFile, setAvatarFile]                 = useState(null)
  const [formData, setFormData]                     = useState({
    name: '', email: '',
    currentPassword: '', newPassword: '', confirmNewPassword: ''
  })

  const { currentUser } = useContext(UserContext)
  const isOwnProfile    = currentUser?.id === id

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await API.get(`/users/${id}`)
        setUserData(response.data)
        setFormData({
          name:             response.data.name  || '',
          email:            response.data.email || '',
          currentPassword:  '',
          newPassword:      '',
          confirmNewPassword: ''
        })
        setAvatar(resolveMediaUrl(response.data.avatar))
        setError('')
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('Failed to load user profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [id])

  usePostStream((event, payload) => {
    if (event === 'profile_updated' && String(payload._id) === String(id)) {
      setUserData(payload)
      setFormData(prev => ({
        ...prev,
        name:  payload.name  || prev.name,
        email: payload.email || prev.email
      }))
      if (payload.avatar) setAvatar(resolveMediaUrl(payload.avatar))
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setAvatar(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!isOwnProfile) return setError('Unauthorized')

    setIsLoading(true)
    setError('')

    try {
      // 1. Handle password change if requested
      if (isChangingPassword && formData.newPassword) {
        if (!formData.currentPassword) {
          setError('Current password required')
          setIsLoading(false)
          return
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }
        await API.patch('/users/edit-user', {
          currentPassword:    formData.currentPassword,
          newPassword:        formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        })
      }

      // 2. Handle profile update (name, email, avatar)
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      if (avatarFile) formDataToSend.append('avatar', avatarFile)

      const response = await API.patch(`/users/${id}`, formDataToSend)

      setUserData(response.data)
      if (response.data.avatar) setAvatar(resolveMediaUrl(response.data.avatar))

      setIsEditing(false)
      setIsChangingPassword(false)
      setAvatarFile(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading)    return <section className="profile"><Loader /></section>
  if (!userData)  return (
    <section className="profile">
      <div className="center"><p className="form__error-message">User not found.</p></div>
    </section>
  )

  return (
    <section className="profile">
      <div className="container profile__container">
        {isOwnProfile && (
          <Link to="/dashboard" onClick={scrollTop} className="btn">My Posts</Link>
        )}

        <div className="profile__details">
          <div className="avatar__wrapper">
            <div className="profile__avatar">
              <img src={avatar} alt="User Avatar" />
            </div>
            {isEditing && (
              <form className="avatar__form">
                <input type="file" name="avatar" id="avatar"
                  accept="image/*" onChange={handleAvatarChange} />
                <label htmlFor="avatar"><FaEdit /></label>
              </form>
            )}
          </div>

          <h1>{userData.name}</h1>
          <p className="profile__email">{userData.email}</p>

          {error && <p className="form__error-message">{error}</p>}

          {isEditing ? (
            <form className="form profile__form" onSubmit={handleSaveProfile}>
              <input type="text"  name="name"  placeholder="Full Name" value={formData.name}  onChange={handleInputChange} />
              <input type="email" name="email" placeholder="Email"     value={formData.email} onChange={handleInputChange} />

              {!isChangingPassword ? (
                <button type="button" className="btn"
                  onClick={() => setIsChangingPassword(true)}>
                  Change Password
                </button>
              ) : (
                <>
                  <input type="password" name="currentPassword"    placeholder="Current Password"     value={formData.currentPassword}    onChange={handleInputChange} />
                  <input type="password" name="newPassword"        placeholder="New Password"         value={formData.newPassword}        onChange={handleInputChange} />
                  <input type="password" name="confirmNewPassword" placeholder="Confirm New Password" value={formData.confirmNewPassword} onChange={handleInputChange} />
                  <button type="button" className="btn"
                    onClick={() => setIsChangingPassword(false)}>
                    Cancel Password Change
                  </button>
                </>
              )}

              <button type="submit" className="btn primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn"
                onClick={() => { setIsEditing(false); setIsChangingPassword(false); setError('') }}>
                Cancel
              </button>
            </form>
          ) : (
            isOwnProfile && (
              <button className="btn primary" onClick={() => setIsEditing(true)}>
                <FaEdit /> Edit Profile
              </button>
            )
          )}

          <div className="profile__stats">
            <div className="profile__stat">
              <h5>Posts</h5>
              <p>{userData.posts || 0}</p>
            </div>
          </div>
        </div>

        <UserPosts userId={id} />
      </div>
    </section>
  )
}

const UserPosts = ({ userId }) => {
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await API.get(`/posts/users/${userId}`)
        setPosts(Array.isArray(response.data) ? response.data : [])
      } catch { setPosts([]) }
      finally { setLoading(false) }
    }
    if (userId) fetchUserPosts()
  }, [userId])

  if (loading) return <div className="profile__posts"><Loader size="small" /></div>

  return (
    <div className="profile__posts" style={{ marginTop: '3rem' }}>
      <h2>Posts ({posts.length})</h2>
      <div className="container posts__container">
        {posts.map(post => (
          <PostItem
            key={post._id}
            postID={post._id}
            thumbnail={post.thumbnail}
            videoUrl={post.videoUrl}
            category={post.category}
            title={post.title}
            description={post.description}
            authorID={post.creator}
            createdAt={post.createdAt}
            likesCount={post.likesCount}
            likedBy={post.likedBy}
          />
        ))}
      </div>
    </div>
  )
}

export default UserProfile