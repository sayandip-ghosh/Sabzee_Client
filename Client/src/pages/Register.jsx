import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    role: 'consumer',
    farmDetails: {
      farmName: '',
      farmSize: '',
      mainCrops: '',
      location: {
        coordinates: [0, 0]
      }
    }
  });
  
  const [formError, setFormError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const { 
    name, email, password, confirmPassword, contactNumber, role, 
    farmDetails: { farmName, farmSize, mainCrops, location } 
  } = formData;

  const handleChange = (e) => {
    if (e.target.name.includes('farmDetails.')) {
      const farmField = e.target.name.split('.')[1];
      if (farmField === 'coordinates') {
        const [index, value] = e.target.value.split(',');
        setFormData({
          ...formData,
          farmDetails: {
            ...formData.farmDetails,
            location: {
              ...formData.farmDetails.location,
              coordinates: formData.farmDetails.location.coordinates.map((coord, i) => 
                i === parseInt(index) ? parseFloat(value) : coord
              )
            }
          }
        });
      } else {
        setFormData({
          ...formData,
          farmDetails: {
            ...formData.farmDetails,
            [farmField]: e.target.value
          }
        });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    const userData = {
      name,
      email,
      password,
      contactNumber,
      role
    };

    if (role === 'farmer') {
      // Process mainCrops from comma-separated string to array
      const cropsArray = mainCrops.split(',').map(crop => crop.trim()).filter(crop => crop !== '');
      
      userData.farmDetails = {
        farmName,
        farmSize: parseFloat(farmSize),
        mainCrops: cropsArray,
        location: {
          coordinates: formData.farmDetails.location.coordinates
        }
      };
    }

    try {
      await register(userData);
      navigate('/');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            login to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {formError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <div className="mt-1">
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={contactNumber}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="consumer">Consumer</option>
                  <option value="farmer">Farmer</option>
                </select>
              </div>
            </div>

            {role === 'farmer' && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Farm Details</h3>
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                    Farm Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="farmName"
                      name="farmDetails.farmName"
                      type="text"
                      required={role === 'farmer'}
                      value={farmName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700">
                    Farm Size (in acres)
                  </label>
                  <div className="mt-1">
                    <input
                      id="farmSize"
                      name="farmDetails.farmSize"
                      type="number"
                      step="0.01"
                      required={role === 'farmer'}
                      value={farmSize}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mainCrops" className="block text-sm font-medium text-gray-700">
                    Main Crops (comma separated)
                  </label>
                  <div className="mt-1">
                    <input
                      id="mainCrops"
                      name="farmDetails.mainCrops"
                      type="text"
                      required={role === 'farmer'}
                      value={mainCrops}
                      onChange={handleChange}
                      placeholder="e.g. Tomatoes, Potatoes, Onions"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                      Longitude
                    </label>
                    <div className="mt-1">
                      <input
                        id="longitude"
                        name="farmDetails.coordinates"
                        type="number"
                        step="0.000001"
                        required={role === 'farmer'}
                        value={formData.farmDetails.location.coordinates[0]}
                        onChange={(e) => handleChange({
                          target: {
                            name: 'farmDetails.coordinates',
                            value: `0,${e.target.value}`
                          }
                        })}
                        placeholder="e.g. 88.3639"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                      Latitude
                    </label>
                    <div className="mt-1">
                      <input
                        id="latitude"
                        name="farmDetails.coordinates"
                        type="number"
                        step="0.000001"
                        required={role === 'farmer'}
                        value={formData.farmDetails.location.coordinates[1]}
                        onChange={(e) => handleChange({
                          target: {
                            name: 'farmDetails.coordinates',
                            value: `1,${e.target.value}`
                          }
                        })}
                        placeholder="e.g. 22.5726"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 