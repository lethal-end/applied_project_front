import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Carousel } from 'react-bootstrap';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function App() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({
    name: '',
    age_days: '',
    gender: '',
    sterilized: '',
    primary_breed: '',
    primary_color: '',
    intake_type: '',
    intake_condition: '',
    status: 'Available'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [view, setView] = useState("user");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/cats');
      if (!response.ok) {
        throw new Error('Failed to fetch cats');
      }
      const data = await response.json();
      setCats(data);
    } catch (error) {
      console.error('Error fetching cats:', error);
      //alert('Error fetching cats');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const addCat = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('pictures', selectedFiles[i]);
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/api/cats/add', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add cat');
      }
      const data = await response.json();
      fetchCats();
      setForm({
        name: '',
        age_days: '',
        gender: '',
        sterilized: '',
        primary_breed: '',
        primary_color: '',
        intake_type: '',
        intake_condition: '',
        status: 'Available'
      });
      setSelectedFiles([]);
      //alert(`Cat added successfully! Adoption Chance: ${data.adoption_chance}%`);
    } catch (error) {
      console.error('Error adding cat:', error);
      //alert(`Error adding cat: ${error.message}`);
    }
  };

  const deleteCat = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cat?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/cats/${id}/delete`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete cat');
      }
      const data = await response.json();
      //alert(data.message);
      fetchCats();
    } catch (error) {
      console.error('Error deleting cat:', error);
      //alert('Error deleting cat');
    }
  };

  const accessAdminPanel = () => {
    if (isAdmin) {
      setView("admin");
      return;
    }
    const code = prompt("Enter admin access code:");
    if (code === "123123") {
      setView("admin");
      setIsAdmin(true);
    } else {
      alert("Incorrect code.");
    }
  };

  const catStatuses = cats.reduce((acc, cat) => {
    acc[cat.status] = (acc[cat.status] || 0) + 1;
    return acc;
  }, {});

  const breedCounts = cats.reduce((acc, cat) => {
    acc[cat.primary_breed] = (acc[cat.primary_breed] || 0) + 1;
    return acc;
  }, {});

  const ageGroups = cats.reduce((acc, cat) => {
    const age = parseInt(cat.age_days, 10);
    let group = '';
    if (age < 180) {
      group = 'Kitten (<6 months)';
    } else if (age < 365) {
      group = 'Young (6 months - 1 year)';
    } else if (age < 1825) {
      group = 'Adult (1-5 years)';
    } else {
      group = 'Senior (>5 years)';
    }
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  const genderCounts = cats.reduce((acc, cat) => {
    acc[cat.gender] = (acc[cat.gender] || 0) + 1;
    return acc;
  }, {});

  const sterilizedCounts = cats.reduce((acc, cat) => {
    acc[cat.sterilized] = (acc[cat.sterilized] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = {
    labels: Object.keys(catStatuses),
    datasets: [
      {
        label: 'Number of Cats',
        data: Object.values(catStatuses),
        backgroundColor: ['#1f77b4', '#ff7f0e'],
      },
    ],
  };

  const breedChartData = {
    labels: Object.keys(breedCounts),
    datasets: [
      {
        label: 'Number of Cats',
        data: Object.values(breedCounts),
        backgroundColor: '#2ca02c',
      },
    ],
  };

  const ageGroupChartData = {
    labels: Object.keys(ageGroups),
    datasets: [
      {
        label: 'Number of Cats',
        data: Object.values(ageGroups),
        backgroundColor: ['#d62728', '#9467bd', '#8c564b', '#e377c2'],
      },
    ],
  };

  const genderChartData = {
    labels: Object.keys(genderCounts),
    datasets: [
      {
        label: 'Number of Cats',
        data: Object.values(genderCounts),
        backgroundColor: ['#17becf', '#bcbd22', '#7f7f7f'],
      },
    ],
  };

  const sterilizedChartData = {
    labels: Object.keys(sterilizedCounts),
    datasets: [
      {
        label: 'Number of Cats',
        data: Object.values(sterilizedCounts),
        backgroundColor: ['#ff9896', '#98df8a', '#c5b0d5'],
      },
    ],
  };

  return (
    <div className="App bg-dark text-light min-vh-100">
      <div className="container py-4">
        <h1 className="text-center my-4">🐾 SafeShelter: Cat Adoption Platform 🐾</h1>

        <div className="text-center mb-4">
          <button className="btn btn-outline-light me-2" onClick={() => setView("user")}>User View</button>
          <button className="btn btn-outline-light" onClick={accessAdminPanel}>Admin Panel</button>
        </div>

        {view === "user" ? (
          <div>
            <h2 className="mb-4">Available Cats for Adoption</h2>
            <div className="row">
              {cats.filter(cat => cat.status === "Available").map(cat => (
                <div key={cat.id} className="col-md-4 mb-4">
                  <div className="card bg-secondary text-light h-100">
                    {cat.images && cat.images.length > 0 ? (
                      <Carousel interval={null}>
                        {cat.images.map((image, index) => (
                          <Carousel.Item key={index}>
                            <img
                              className="d-block w-100"
                              src={`http://127.0.0.1:5000/static/uploads/${image}`}
                              alt={`Slide ${index}`}
                              style={{ height: '300px', objectFit: 'cover' }}
                            />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    ) : (
                      <img src="placeholder.jpg" className="card-img-top" alt={cat.name} />
                    )}
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{cat.name}</h5>
                      <p className="card-text">
                        Breed: {cat.primary_breed}<br />
                        Age: {cat.age_days} days<br />
                        Gender: {cat.gender}<br />
                        Sterilized: {cat.sterilized}<br />
                        Color: {cat.primary_color}<br />
                        Intake Type: {cat.intake_type}<br />
                        Intake Condition: {cat.intake_condition}
                      </p>
                      <p className="card-text">
                        <strong>Adoption Chance:</strong> {cat.adoption_chance}%
                      </p>
                      <div className="mt-auto">
                        <button
                          className="btn btn-success btn-sm mt-2"
                          onClick={() => alert("For any adoption inquiries, please send an email to 123@gmail.com")}
                        >
                          Adopt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isAdmin ? (
          <div>
            <h2 className="mb-4">Admin Panel</h2>
            <form className="mb-5" onSubmit={addCat}>
              <div className="row g-3">
                {/* Name */}
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control bg-dark text-light"
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Age in Days */}
                <div className="col-md-1">
                  <input
                    type="number"
                    className="form-control bg-dark text-light"
                    name="age_days"
                    placeholder="Age (Days)"
                    value={form.age_days}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Gender */}
                <div className="col-md-1">
                  <select className="form-select bg-dark text-light" name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                {/* Sterilized */}
                <div className="col-md-1">
                  <select className="form-select bg-dark text-light" name="sterilized" value={form.sterilized} onChange={handleChange} required>
                    <option value="">Sterilized</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                {/* Primary Breed */}
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control bg-dark text-light"
                    name="primary_breed"
                    placeholder="Primary Breed"
                    value={form.primary_breed}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Primary Color */}
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control bg-dark text-light"
                    name="primary_color"
                    placeholder="Primary Color"
                    value={form.primary_color}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Intake Type */}
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control bg-dark text-light"
                    name="intake_type"
                    placeholder="Intake Type"
                    value={form.intake_type}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Intake Condition */}
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control bg-dark text-light"
                    name="intake_condition"
                    placeholder="Intake Condition"
                    value={form.intake_condition}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Status */}
                <div className="col-md-1">
                  <select className="form-select bg-dark text-light" name="status" value={form.status} onChange={handleChange}>
                    <option value="Available">Available</option>
                    <option value="Adopted">Adopted</option>
                  </select>
                </div>
                {/* Pictures */}
                <div className="col-md-3">
                  <input
                    type="file"
                    className="form-control bg-dark text-light"
                    name="pictures"
                    onChange={handleFileChange}
                    multiple
                    required
                  />
                </div>
                {/* Submit Button */}
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary w-100">Add Cat</button>
                </div>
              </div>
            </form>

            {/* Manage Cats Table */}
            <h3 className="mb-4">Manage Cats</h3>
            <div className="table-responsive">
              <table className="table table-dark table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Breed</th>
                    <th>Age (Days)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>{cat.primary_breed}</td>
                      <td>{cat.age_days}</td>
                      <td>
                        <span className={`badge ${cat.status === "Available" ? "bg-success" : "bg-secondary"}`}>
                          {cat.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCat(cat.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Data Visualization */}
            <h3 className="mb-4">Data Visualization</h3>
            <div className="row mb-5">
              {/* Cats by Status */}
              <div className="col-md-6 mb-4">
                <div className="card bg-secondary text-light">
                  <div className="card-body">
                    <h5 className="card-title">Cats by Status</h5>
                    <Pie data={statusChartData} />
                  </div>
                </div>
              </div>
              {/* Cats by Breed */}
              <div className="col-md-6 mb-4">
                <div className="card bg-secondary text-light">
                  <div className="card-body">
                    <h5 className="card-title">Cats by Breed</h5>
                    <Bar data={breedChartData} options={{ indexAxis: 'y' }} />
                  </div>
                </div>
              </div>
              {/* Cats by Age Group */}
              <div className="col-md-6 mb-4">
                <div className="card bg-secondary text-light">
                  <div className="card-body">
                    <h5 className="card-title">Cats by Age Group</h5>
                    <Pie data={ageGroupChartData} />
                  </div>
                </div>
              </div>
              {/* Gender Distribution */}
              <div className="col-md-6 mb-4">
                <div className="card bg-secondary text-light">
                  <div className="card-body">
                    <h5 className="card-title">Gender Distribution</h5>
                    <Pie data={genderChartData} />
                  </div>
                </div>
              </div>
              {/* Sterilization Status */}
              <div className="col-md-6 mb-4">
                <div className="card bg-secondary text-light">
                  <div className="card-body">
                    <h5 className="card-title">Sterilization Status</h5>
                    <Pie data={sterilizedChartData} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
