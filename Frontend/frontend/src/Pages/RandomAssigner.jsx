import React, { useState, useEffect } from 'react';
import '../styles/RandomAssigner.css';

const RandomAssigner = ({ students, onAssignStudents }) => {
  const [outstandingStudents, setOutstandingStudents] = useState([]);
  const [aboveAvgStudents, setAboveAvgStudents] = useState([]);
  const [mediocreStudents, setMediocreStudents] = useState([]);
  const [lowStudents, setLowStudents] = useState([]);
  const [lastAssigned, setLastAssigned] = useState([]);
  const [isAssigned, setIsAssigned] = useState(false);

  // Categorize students by their CGPA
  useEffect(() => {
    const outstanding = students.filter(s => s.academicDetails.cgpa >= 3.7);
    const aboveAvg = students.filter(s => s.academicDetails.cgpa >= 3.0 && s.academicDetails.cgpa < 3.7);
    const mediocre = students.filter(s => s.academicDetails.cgpa >= 2.0 && s.academicDetails.cgpa < 3.0);
    const low = students.filter(s => s.academicDetails.cgpa < 2.0);

    setOutstandingStudents(outstanding);
    setAboveAvgStudents(aboveAvg);
    setMediocreStudents(mediocre);
    setLowStudents(low);

    // Load last assigned students from localStorage
    const savedLastAssigned = localStorage.getItem('lastAssignedStudents');
    if (savedLastAssigned) {
      setLastAssigned(JSON.parse(savedLastAssigned));
    }
  }, [students]);

  const assignRandomStudents = () => {
    // Filter out students who were assigned last time
    const availableOutstanding = outstandingStudents.filter(s => !lastAssigned.includes(s.id));
    const availableAboveAvg = aboveAvgStudents.filter(s => !lastAssigned.includes(s.id));
    const availableMediocre = mediocreStudents.filter(s => !lastAssigned.includes(s.id));
    const availableLow = lowStudents.filter(s => !lastAssigned.includes(s.id));

    // If not enough students available, include those who were assigned last time
    const finalOutstanding = availableOutstanding.length >= 3 ? 
      availableOutstanding : outstandingStudents;
    const finalAboveAvg = availableAboveAvg.length >= 3 ? 
      availableAboveAvg : aboveAvgStudents;
    const finalMediocre = availableMediocre.length >= 2 ? 
      availableMediocre : mediocreStudents;
    const finalLow = availableLow.length >= 2 ? 
      availableLow : lowStudents;

    // Shuffle and select students
    const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());
    
    const selectedOutstanding = shuffle(finalOutstanding).slice(0, 3);
    const selectedAboveAvg = shuffle(finalAboveAvg).slice(0, 3);
    const selectedMediocre = shuffle(finalMediocre).slice(0, 2);
    const selectedLow = shuffle(finalLow).slice(0, 2);

    const selectedStudents = [
      ...selectedOutstanding,
      ...selectedAboveAvg,
      ...selectedMediocre,
      ...selectedLow
    ];

    // Save the IDs of selected students to avoid selecting them next time
    const selectedIds = selectedStudents.map(s => s.id);
    setLastAssigned(selectedIds);
    localStorage.setItem('lastAssignedStudents', JSON.stringify(selectedIds));

    // Call the parent component with the selected students
    onAssignStudents(selectedStudents);
    setIsAssigned(true);
  };

  return (
    <div className="random-assigner">
      <h3>Random Student Assignment</h3>
      <p>
        This tool will randomly select 10 students to receive the feedback form:
        <br />
        3 Outstanding (CGPA ≥ 3.7), 3 Above Average (3.0-3.69), 
        2 Mediocre (2.0-2.99), and 2 Low (CGPA &lt; 2.0).
      </p>
      
      <div className="student-counts">
        <div className="count-item">
          <span className="count-label">Outstanding:</span>
          <span className="count-value">{outstandingStudents.length}</span>
        </div>
        <div className="count-item">
          <span className="count-label">Above Average:</span>
          <span className="count-value">{aboveAvgStudents.length}</span>
        </div>
        <div className="count-item">
          <span className="count-label">Mediocre:</span>
          <span className="count-value">{mediocreStudents.length}</span>
        </div>
        <div className="count-item">
          <span className="count-label">Low:</span>
          <span className="count-value">{lowStudents.length}</span>
        </div>
      </div>

      <button 
        className="assign-btn"
        onClick={assignRandomStudents}
        disabled={isAssigned}
      >
        {isAssigned ? 'Students Assigned' : 'Assign Random Students'}
      </button>

      {isAssigned && (
        <div className="assignment-success">
          <p>Students have been successfully assigned to this feedback form.</p>
        </div>
      )}
    </div>
  );
};

export default RandomAssigner;