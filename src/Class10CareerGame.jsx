import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';

// GOOGLE INTEGRATION (Demo Mode - logs to console)
const trackGameStarted = (p, f, c) => console.log('📊 game_started', {p, f, c});
const trackGameWon = (p, f, c, s) => console.log('📊 game_won', {p, f, c, s});
const trackGameLost = (p, f, c, s, r) => console.log('📊 game_lost', {p, f, c, s, r});
const saveGameResult = (d) => console.log('💾 Firestore save', d);

const Class10CareerGame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('pathChoice');
  const [careerPath, setCareerPath] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [score, setScore] = useState(0);
  const [currentNode, setCurrentNode] = useState(0);
  const [lossReason, setLossReason] = useState('');
  const [boundaryHits, setBoundaryHits] = useState(0);
  const [hitDistractions, setHitDistractions] = useState([]);
  const [warningMessage, setWarningMessage] = useState(null);
  const audioContextRef = useRef(null);

  const distractionTypes = [
    { name: 'Breakup', icon: '💔', penalty: 75, message: 'Emotional distress affecting focus' },
    { name: 'Alcohol', icon: '🍺', penalty: 75, message: 'Poor decisions and health issues' },
    { name: 'Smoking', icon: '🚬', penalty: 75, message: 'Health problems reducing productivity' },
    { name: 'Drugs', icon: '💊', penalty: 100, message: 'Severe impact on career and life' },
    { name: 'Laziness', icon: '😴', penalty: 50, message: 'Missed opportunities and delays' },
    { name: 'Social Media', icon: '📱', penalty: 60, message: 'Time wasted, focus destroyed' },
    { name: 'Peer Pressure', icon: '👥', penalty: 65, message: 'Wrong choices to fit in' },
    { name: 'Procrastination', icon: '⏰', penalty: 70, message: 'Deadlines missed, stress increased' },
    { name: 'Gaming Addiction', icon: '🎮', penalty: 80, message: 'Career goals forgotten' },
    { name: 'Overspending', icon: '💸', penalty: 55, message: 'Financial stress and debt' }
  ];

  const jobFields = {
    science: {
      name: 'Science Stream',
      icon: '🔬',
      color: '#3b82f6',
      subfields: {
        engineering: {
          name: 'Engineering',
          color: '#3b82f6',
          nodes: ['PCM Foundation', 'JEE Preparation', 'Engineering College', 'Internship', 'Engineer'],
          details: ['Study Physics, Chemistry, Math', '1-2 years intense prep', '4-year B.Tech program', 'Work at top companies', 'Salary ₹4-8 LPA']
        },
        medical: {
          name: 'Medical (MBBS)',
          color: '#10b981',
          nodes: ['PCB Foundation', 'NEET Preparation', 'Medical College', 'Residency', 'Doctor'],
          details: ['Study Physics, Chemistry, Biology', '1-2 years exam prep', '4.5-year MBBS program', '3-year specialized training', 'Salary ₹3-15 LPA']
        },
        research: {
          name: 'Pure Science',
          color: '#8b5cf6',
          nodes: ['Science Foundation', 'BSc Degree', 'MSc/PhD', 'Research', 'Scientist'],
          details: ['Strong science fundamentals', '3-year bachelor degree', '2-year masters + 3-4 year PhD', 'Work in research labs', 'Salary ₹2-12 LPA']
        },
        pharmacy: {
          name: 'Pharmacy',
          color: '#14b8a6',
          nodes: ['PCB/PCM', 'B.Pharm', 'Internship', 'License', 'Pharmacist'],
          details: ['Study with Chemistry focus', '4-year pharmacy degree', '1-year mandatory internship', 'Clear licensing exams', 'Salary ₹2.5-6 LPA']
        }
      }
    },
    commerce: {
      name: 'Commerce Stream',
      icon: '💼',
      color: '#f59e0b',
      subfields: {
        ca: {
          name: 'Chartered Accountant',
          color: '#f59e0b',
          nodes: ['Commerce + Maths', 'CPT/Foundation', 'CA Intermediate', 'Articleship', 'CA Final'],
          details: ['12th with accountancy', 'Pass foundation exam', '8 months + articleship', '3 years internship', 'Salary ₹5-25 LPA']
        },
        business: {
          name: 'Business Management',
          color: '#ef4444',
          nodes: ['Commerce Stream', 'BBA Degree', 'MBA', 'Management Role', 'Business Leader'],
          details: ['Choose commerce subjects', '3-year BBA degree', '2-year specialized MBA', 'Manager/analyst role', 'Salary ₹8-50+ LPA']
        },
        economics: {
          name: 'Economics',
          color: '#ec4899',
          nodes: ['Commerce + Maths', 'BA/BCom Economics', 'Masters', 'Research/Policy', 'Economist'],
          details: ['Commerce + Mathematics', '3-year economics degree', '2-year advanced masters', 'Research/policy work', 'Salary ₹3-12 LPA']
        },
        banking: {
          name: 'Banking & Finance',
          color: '#06b6d4',
          nodes: ['Commerce Stream', 'BCom/BBA', 'Banking Exams', 'Bank Officer', 'Senior Manager'],
          details: ['Choose commerce', '3-year degree', 'IBPS/SBI exams', 'Probationary officer', 'Salary ₹6-20 LPA']
        }
      }
    },
    arts: {
      name: 'Arts/Humanities',
      icon: '🎨',
      color: '#a855f7',
      subfields: {
        law: {
          name: 'Law',
          color: '#7c3aed',
          nodes: ['Arts Stream', 'Law Entrance', 'LLB Degree', 'Practice', 'Advocate'],
          details: ['Choose arts subjects', 'Clear CLAT/state exams', '5 or 3-year LLB', 'Legal internships', 'Salary ₹3-50+ LPA']
        },
        psychology: {
          name: 'Psychology',
          color: '#ec4899',
          nodes: ['Arts Stream', 'BA Psychology', 'Masters/PhD', 'Practice/Research', 'Psychologist'],
          details: ['Arts with psychology', '3-year BA degree', '2-year masters/PhD', 'Counselor or researcher', 'Salary ₹3-8 LPA']
        },
        journalism: {
          name: 'Journalism',
          color: '#f59e0b',
          nodes: ['Arts Stream', 'Mass Comm', 'Internships', 'Reporter', 'Senior Journalist'],
          details: ['Arts with strong English', '3-year bachelor degree', 'Media outlet internships', 'Reporter/editor role', 'Salary ₹2-15 LPA']
        },
        teaching: {
          name: 'Teaching',
          color: '#10b981',
          nodes: ['Subject Choice', 'Graduation', 'B.Ed/TET', 'Teaching Job', 'Senior Teacher'],
          details: ['Choose subject', '3-year degree', 'B.Ed + TET exams', 'School teaching', 'Salary ₹2.5-6 LPA']
        }
      }
    },
    vocational: {
      name: 'Vocational/Skills',
      icon: '🛠️',
      color: '#ef4444',
      subfields: {
        it: {
          name: 'IT & Programming',
          color: '#3b82f6',
          nodes: ['Basic Computer', 'Coding Skills', 'Certifications', 'IT Job', 'Tech Expert'],
          details: ['Learn fundamentals', '1-2 years coding', 'Google/Microsoft certs', 'Junior developer role', 'Salary ₹3-20 LPA']
        },
        design: {
          name: 'Design & Animation',
          color: '#ec4899',
          nodes: ['Art Basics', 'Design Course', 'Portfolio', 'Designer Job', 'Creative Director'],
          details: ['Art foundations', '2-3 year course', 'Build portfolio', 'Design studios/agencies', 'Salary ₹2.5-10 LPA']
        },
        hospitality: {
          name: 'Hotel Management',
          color: '#f59e0b',
          nodes: ['Hospitality Basics', 'IHM Course', 'Training', 'Hotel Job', 'Hotel Manager'],
          details: ['Customer service basics', '3-year hotel mgmt', '5-star hotel training', 'Executive/supervisor', 'Salary ₹2.5-15 LPA']
        },
        fashion: {
          name: 'Fashion Design',
          color: '#a855f7',
          nodes: ['Creative Arts', 'Fashion Institute', 'Internship', 'Designer', 'Fashion Brand'],
          details: ['Sketching/design', '4-year fashion degree', 'Brand internships', 'Fashion designer', 'Salary ₹3-20 LPA']
        }
      }
    }
  };

  const businessFields = {
    science: {
      name: 'Science + Business',
      icon: '🔬💼',
      color: '#3b82f6',
      subfields: {
        biotech: {
          name: 'Biotech Startup',
          color: '#3b82f6',
          nodes: ['Science Foundation', 'Product Research', 'Seed Funding', 'Market Launch', 'Scale Business'],
          details: ['Strong science base', 'Develop biotech product', 'Raise capital from investors', 'Launch to market', 'Revenue ₹10-100+ LPA']
        },
        medtech: {
          name: 'MedTech Entrepreneur',
          color: '#10b981',
          nodes: ['Medical Knowledge', 'Innovation Design', 'Prototype', 'FDA/Regulatory', 'Medical Business'],
          details: ['Study medicine/engineering', 'Design medical device', 'Build working prototype', 'Get approvals', 'Revenue ₹15-200+ LPA']
        },
        saas: {
          name: 'SaaS for Scientists',
          color: '#8b5cf6',
          nodes: ['Science + Coding', 'Build Platform', 'Beta Testing', 'Launch Product', 'SaaS Company'],
          details: ['Learn programming + science', 'Create software for researchers', 'Test with universities', 'Public launch', 'Revenue ₹5-50+ LPA']
        },
        pharma: {
          name: 'Pharmaceutical Business',
          color: '#14b8a6',
          nodes: ['Pharma Knowledge', 'Manufacturing Setup', 'Licensing', 'Distribution', 'Pharma Company'],
          details: ['Study pharmaceutical science', 'Setup production facility', 'Get drug licenses', 'Build supply chain', 'Revenue ₹20-200+ LPA']
        }
      }
    },
    commerce: {
      name: 'Commerce + Business',
      icon: '💼🚀',
      color: '#f59e0b',
      subfields: {
        consultancy: {
          name: 'Own Consultancy Firm',
          color: '#f59e0b',
          nodes: ['CA/MBA Degree', 'Work Experience', 'Register Firm', 'Build Clients', 'Expand Firm'],
          details: ['Get professional degree', '3-5 years industry work', 'Start own practice', 'Acquire client base', 'Revenue ₹10-50+ LPA']
        },
        retail: {
          name: 'Retail Business',
          color: '#ef4444',
          nodes: ['Business Basics', 'Market Research', 'Setup Store', 'Operations', 'Chain Expansion'],
          details: ['Learn commerce fundamentals', 'Study target market', 'Open first location', 'Manage daily business', 'Revenue ₹5-100+ LPA']
        },
        fintech: {
          name: 'FinTech Startup',
          color: '#ec4899',
          nodes: ['Finance + Tech', 'Build App', 'RBI Approval', 'User Growth', 'FinTech Company'],
          details: ['Learn finance and coding', 'Create financial app', 'Get regulatory approval', 'Acquire customers', 'Revenue ₹10-500+ LPA']
        },
        ecommerce: {
          name: 'E-commerce Business',
          color: '#06b6d4',
          nodes: ['Product Selection', 'Online Store', 'Marketing', 'Logistics', 'Scale Online'],
          details: ['Choose product niche', 'Build website/marketplace', 'Digital advertising', 'Setup delivery system', 'Revenue ₹3-80+ LPA']
        }
      }
    },
    arts: {
      name: 'Arts + Business',
      icon: '🎨🚀',
      color: '#a855f7',
      subfields: {
        agency: {
          name: 'Creative Agency',
          color: '#7c3aed',
          nodes: ['Creative Skills', 'Freelance Work', 'Register Agency', 'Hire Team', 'Major Clients'],
          details: ['Master design/content', 'Build portfolio as freelancer', 'Form legal entity', 'Recruit talent', 'Revenue ₹8-80+ LPA']
        },
        media: {
          name: 'Media Production Company',
          color: '#ec4899',
          nodes: ['Media Training', 'Content Creation', 'Production Setup', 'Distribution', 'Scale Production'],
          details: ['Learn media production', 'Create sample content', 'Get equipment/studio', 'Platform partnerships', 'Revenue ₹10-100+ LPA']
        },
        publishing: {
          name: 'Publishing House',
          color: '#f59e0b',
          nodes: ['Writing/Editing', 'Digital Platform', 'Author Network', 'Book Releases', 'Publishing Brand'],
          details: ['Master content creation', 'Build online presence', 'Sign authors', 'Publish books/content', 'Revenue ₹5-50+ LPA']
        },
        coaching: {
          name: 'Coaching Institute',
          color: '#10b981',
          nodes: ['Teaching Skills', 'Small Batches', 'Register Institute', 'Hire Faculty', 'Multi-center'],
          details: ['Become expert teacher', 'Start with few students', 'Legal registration', 'Build teacher team', 'Revenue ₹5-100+ LPA']
        }
      }
    },
    vocational: {
      name: 'Vocational + Business',
      icon: '🛠️🚀',
      color: '#ef4444',
      subfields: {
        startup: {
          name: 'Tech Startup',
          color: '#3b82f6',
          nodes: ['Coding Skills', 'Build MVP', 'Find Co-founders', 'Funding Round', 'Tech Company'],
          details: ['Learn programming', 'Create minimum product', 'Form startup team', 'Raise venture capital', 'Revenue ₹5-500+ LPA']
        },
        studio: {
          name: 'Design Studio',
          color: '#ec4899',
          nodes: ['Design Mastery', 'Portfolio', 'Studio Setup', 'Client Projects', 'Studio Growth'],
          details: ['Master design tools', 'Showcase best work', 'Rent space & hire', 'Corporate clients', 'Revenue ₹6-60+ LPA']
        },
        restaurant: {
          name: 'Restaurant Business',
          color: '#f59e0b',
          nodes: ['Culinary Training', 'Menu Design', 'Restaurant Setup', 'Operations', 'Chain/Franchise'],
          details: ['Learn cooking/hospitality', 'Create unique menu', 'Setup first location', 'Daily management', 'Revenue ₹4-80+ LPA']
        },
        fashionBiz: {
          name: 'Fashion Brand',
          color: '#a855f7',
          nodes: ['Design Skills', 'Collection', 'Brand Launch', 'Retail/Online', 'Fashion House'],
          details: ['Master fashion design', 'Create first collection', 'Launch brand identity', 'Sales channels', 'Revenue ₹5-100+ LPA']
        }
      }
    }
  };

  const getCurrentFields = () => careerPath === 'business' ? businessFields : jobFields;

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => { if (audioContextRef.current) audioContextRef.current.close(); };
  }, []);

  const playFlapSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 300;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  };

  const playSuccessSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 523;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.2);
  };

  useEffect(() => {
    if (gameState !== 'playing' || !selectedCareer || !selectedField || !careerPath) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const bird = { x: 150, y: canvas.height / 2, velocity: 0, gravity: 0.6, jumpStrength: -11, size: 18, speed: 3 };
    const currentFields = getCurrentFields();
    const careerData = currentFields[selectedField].subfields[selectedCareer];
    let cameraX = 0;
    
    const nodes = careerData.nodes.map((name, i) => {
      const ropeLength = 150 + Math.random() * 120;
      const x = 400 + i * 300;
      return {
        baseX: x, x: x, ropeTop: 0, ropeLength: ropeLength, y: ropeLength, radius: 35,
        reached: i < currentNode, active: i === currentNode, name,
        swing: Math.random() * Math.PI * 2, swingSpeed: 0.02 + Math.random() * 0.01
      };
    });

    const bombs = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const numBombs = 1 + Math.floor(Math.random() * 2);
      for (let j = 0; j < numBombs; j++) {
        const distraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
        bombs.push({
          x: nodes[i].baseX + 150 + (j * 80) + Math.random() * 50,
          y: 100 + Math.random() * (canvas.height - 200),
          radius: 25, pulse: Math.random() * Math.PI * 2,
          distraction: distraction
        });
      }
    }

    let gameOver = false;
    let localScore = score;
    let localCurrentNode = currentNode;
    let localHitDistractions = [...hitDistractions];

    const drawRopes = () => {
      nodes.forEach((node) => {
        node.swing += node.swingSpeed;
        const swingOffset = Math.sin(node.swing) * 25;
        node.x = node.baseX + swingOffset - cameraX;
        if (node.x < -100 || node.x > canvas.width + 100) return;
        ctx.strokeStyle = node.reached ? '#10b981' : node.active ? careerData.color : '#4b5563';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        const segments = 12;
        for (let s = 0; s < segments; s++) {
          const y1 = node.ropeTop + (node.ropeLength / segments) * s;
          const y2 = node.ropeTop + (node.ropeLength / segments) * (s + 1);
          const offset = Math.sin(node.swing + s * 0.3) * (s * 1.5);
          ctx.beginPath();
          ctx.moveTo(node.baseX - cameraX + offset * 0.5, y1);
          ctx.lineTo(node.x, y2);
          ctx.stroke();
        }
      });
    };

    const drawNodes = () => {
      nodes.forEach((node, i) => {
        if (node.x < -100 || node.x > canvas.width + 100) return;
        if (node.active) {
          ctx.shadowBlur = 25;
          ctx.shadowColor = careerData.color;
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (node.reached) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
          gradient.addColorStop(0, '#22c55e');
          gradient.addColorStop(1, '#15803d');
          ctx.fillStyle = gradient;
        } else if (node.active) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
          gradient.addColorStop(0, careerData.color);
          gradient.addColorStop(1, '#1e293b');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = '#374151';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 5;
        ctx.fillText(node.name, node.x, node.y + node.radius + 28);
        ctx.shadowBlur = 0;
        ctx.fillStyle = node.active ? '#fff' : '#000';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(i + 1, node.x, node.y + 6);
      });
    };

    const drawBombs = () => {
      bombs.forEach((bomb) => {
        const screenX = bomb.x - cameraX;
        if (screenX < -100 || screenX > canvas.width + 100) return;
        bomb.pulse += 0.08;
        const pulseSize = bomb.radius + Math.sin(bomb.pulse) * 5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ef4444';
        const gradient = ctx.createRadialGradient(screenX, bomb.y, 0, screenX, bomb.y, pulseSize);
        gradient.addColorStop(0, '#fca5a5');
        gradient.addColorStop(0.5, '#ef4444');
        gradient.addColorStop(1, '#991b1b');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, bomb.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💣', screenX, bomb.y + 6);
      });
    };

    const drawBird = () => {
      const rotation = Math.min(Math.max(bird.velocity * 0.06, -0.6), 0.6);
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(rotation);
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, bird.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      const wingY = bird.velocity < 0 ? -12 : 8;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(-8, wingY, 12, 8, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(8, -5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(10, -5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(26, -4);
      ctx.lineTo(26, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const checkNodeCollision = () => {
      const activeNode = nodes.find(n => n.active);
      if (!activeNode) return;
      const dx = bird.x - activeNode.x;
      const dy = bird.y - activeNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < bird.size + activeNode.radius) {
        localCurrentNode++;
        localScore += 100;
        setCurrentNode(localCurrentNode);
        setScore(localScore);
        playSuccessSound();
        nodes.forEach((n, i) => {
          n.reached = i < localCurrentNode;
          n.active = i === localCurrentNode;
        });
        if (localCurrentNode >= nodes.length) {
          setGameState('won');
          gameOver = true;
          trackGameWon(careerPath, selectedField, selectedCareer, localScore);
          saveGameResult({ careerPath, selectedField, selectedCareer, score: localScore, result: 'won', nodesCompleted: localCurrentNode });
        }
      }
    };

    const checkBombCollision = () => {
      for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];
        const screenX = bomb.x - cameraX;
        const dx = bird.x - screenX;
        const dy = bird.y - bomb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bird.size + bomb.radius) {
          // Deduct score (can go negative, then reset to 0)
          localScore = localScore - bomb.distraction.penalty;
          
          // If score goes negative, reset to 0 but keep playing
          if (localScore < 0) {
            localScore = 0;
          }
          
          setScore(localScore);
          
          // Track this distraction
          localHitDistractions.push(bomb.distraction.name);
          setHitDistractions(localHitDistractions);
          
          // Show warning message
          setWarningMessage({
            text: `⚠️ ${bomb.distraction.icon} ${bomb.distraction.name}`,
            subtext: bomb.distraction.message
          });
          setTimeout(() => setWarningMessage(null), 2000);
          
          // Remove the bomb
          bombs.splice(i, 1);
          
          // Game never ends due to score - only boundary hits end the game
          return;
        }
      }
    };

    const gameLoop = () => {
      if (gameOver) return;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 8; i++) {
        const cloudX = (200 + i * 200 - cameraX * 0.3) % (canvas.width + 200);
        ctx.beginPath();
        ctx.arc(cloudX, 80, 40, 0, Math.PI * 2);
        ctx.fill();
      }
      bird.velocity += bird.gravity;
      bird.y += bird.velocity;
      cameraX += bird.speed;
      if (bird.y + bird.size > canvas.height || bird.y - bird.size < 0) {
        // Immediate game over on boundary hit
        setLossReason('boundary');
        setGameState('lost');
        gameOver = true;
        trackGameLost(careerPath, selectedField, selectedCareer, localScore, 'boundary');
        saveGameResult({ 
          careerPath, selectedField, selectedCareer, 
          score: localScore, result: 'lost', 
          lossReason: 'boundary', 
          nodesCompleted: localCurrentNode,
          distractions: localHitDistractions
        });
        return;
      }
      drawRopes();
      drawNodes();
      drawBombs();
      drawBird();
      checkNodeCollision();
      checkBombCollision();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(10, 10, 220, 90);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${localScore}`, 25, 45);
      ctx.fillText(`Node: ${localCurrentNode + 1}/${nodes.length}`, 25, 78);
      
      // Warning message
      if (warningMessage) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(canvas.width / 2 - 250, 150, 500, 100);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(warningMessage.text, canvas.width / 2, 185);
        ctx.font = '18px Arial';
        ctx.fillText(warningMessage.subtext, canvas.width / 2, 220);
      }
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Click or SPACE to Flap', canvas.width / 2, canvas.height - 25);
      animationId = requestAnimationFrame(gameLoop);
    };

    const handleFlap = (e) => {
      if (gameOver) return;
      e.preventDefault();
      bird.velocity = bird.jumpStrength;
      playFlapSound();
    };

    canvas.addEventListener('click', handleFlap);
    canvas.addEventListener('touchstart', handleFlap);
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') handleFlap(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleFlap);
      canvas.removeEventListener('touchstart', handleFlap);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, selectedCareer, selectedField, score, currentNode, careerPath, boundaryHits, hitDistractions, warningMessage]);

  const selectMainField = (field) => {
    setSelectedField(field);
    setGameState('subfield');
  };

  const startGame = (career) => {
    setSelectedCareer(career);
    setGameState('playing');
    setScore(0);
    setCurrentNode(0);
    setBoundaryHits(0);
    setHitDistractions([]);
    setWarningMessage(null);
    trackGameStarted(careerPath, selectedField, career);
  };

  const resetGame = () => {
    setGameState('pathChoice');
    setCareerPath(null);
    setSelectedField(null);
    setSelectedCareer(null);
    setScore(0);
    setCurrentNode(0);
    setLossReason('');
    setBoundaryHits(0);
    setHitDistractions([]);
    setWarningMessage(null);
  };

  if (gameState === 'pathChoice') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold text-white mb-3">Career Adventure Game</h1>
          <p className="text-2xl text-gray-300 mb-12">Choose Your Career Path</p>
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <button onClick={() => { setCareerPath('job'); setGameState('menu'); }} className="bg-slate-800 hover:bg-slate-700 p-12 rounded-2xl border-4 border-blue-500 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-7xl mb-6">💼</div>
              <h3 className="text-4xl font-bold text-white mb-4">Job</h3>
              <p className="text-gray-300 text-lg mb-4">Traditional employment path</p>
              <p className="text-sm text-gray-400">Work for established companies</p>
            </button>
            <button onClick={() => { setCareerPath('business'); setGameState('menu'); }} className="bg-slate-800 hover:bg-slate-700 p-12 rounded-2xl border-4 border-green-500 transition-all transform hover:scale-105 hover:shadow-2xl">
              <div className="text-7xl mb-6">🚀</div>
              <h3 className="text-4xl font-bold text-white mb-4">Job + Business</h3>
              <p className="text-gray-300 text-lg mb-4">Entrepreneurial path</p>
              <p className="text-sm text-gray-400">Build your own ventures</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'menu') {
    const currentFields = getCurrentFields();
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-center max-w-6xl">
          <button onClick={() => { setGameState('pathChoice'); setCareerPath(null); }} className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 mx-auto">
            <ArrowLeft size={24} />Back to Path Choice
          </button>
          <h1 className="text-6xl font-bold text-white mb-3">Career Adventure Game</h1>
          <p className="text-2xl text-gray-300 mb-4">{careerPath === 'business' ? '🚀 Entrepreneurial Path' : '💼 Traditional Job Path'}</p>
          <p className="text-xl text-gray-400 mb-12">Choose Your Stream</p>
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            {Object.entries(currentFields).map(([key, field]) => (
              <button key={key} onClick={() => selectMainField(key)} className="bg-slate-800 hover:bg-slate-700 p-12 rounded-2xl border-4 transition-all transform hover:scale-105 hover:shadow-2xl" style={{ borderColor: field.color }}>
                <div className="text-7xl mb-6">{field.icon}</div>
                <h3 className="text-4xl font-bold text-white mb-4">{field.name}</h3>
                <p className="text-gray-300 text-lg">{Object.keys(field.subfields).length} career paths</p>
                <div className="mt-8 flex items-center justify-center gap-2 text-white">
                  <Play size={28} />
                  <span className="font-bold text-lg">Explore</span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-16 text-gray-400">
            <p className="text-lg mb-2">🎮 Click/SPACE to flap</p>
            <p className="text-base">Avoid distractions and reach all career milestones!</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'subfield') {
    const currentFields = getCurrentFields();
    const field = currentFields[selectedField];
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-center max-w-6xl w-full">
          <button onClick={() => setGameState('menu')} className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 mx-auto">
            <ArrowLeft size={24} />Back
          </button>
          <h1 className="text-5xl font-bold text-white mb-3">{field.name}</h1>
          <p className="text-2xl text-gray-300 mb-12">Choose Your Career</p>
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {Object.entries(field.subfields).map(([key, career]) => (
              <button key={key} onClick={() => startGame(key)} className="bg-slate-800 hover:bg-slate-700 p-8 rounded-2xl border-4 transition-all transform hover:scale-105" style={{ borderColor: career.color }}>
                <h3 className="text-3xl font-bold text-white mb-4">{career.name}</h3>
                <div className="text-gray-300 space-y-2 text-sm mb-4">
                  {career.nodes.map((node, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="font-bold">{i + 1}.</span>
                      <span>{node}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 text-white">
                  <Play size={20} />
                  <span className="font-bold">Play</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <canvas ref={canvasRef} width={1400} height={700} className="border-4 border-slate-700 rounded-xl shadow-2xl max-w-full" style={{ touchAction: 'none' }} />
      </div>
    );
  }

  if (gameState === 'won') {
    const currentFields = getCurrentFields();
    const career = currentFields[selectedField].subfields[selectedCareer];
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-4xl w-full my-8">
          <div className="text-center mb-12">
            <Trophy className="mx-auto text-yellow-400 mb-8 animate-bounce" size={100} />
            <h1 className="text-6xl font-bold text-white mb-4">Career Complete!</h1>
            <p className="text-4xl text-green-200 mb-4">{career.name}</p>
            <p className="text-5xl font-bold text-yellow-400 mb-8">Score: {score}</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-8 mb-8 border-2 border-green-400">
            <h2 className="text-3xl font-bold text-white mb-6">Career Path Details</h2>
            <div className="space-y-4">
              {career.nodes.map((node, i) => (
                <div key={i} className="border-l-4 border-green-400 pl-4">
                  <h3 className="text-xl font-bold text-white">{i + 1}. {node}</h3>
                  <p className="text-gray-300">{career.details[i]}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={resetGame} className="bg-white hover:bg-gray-100 text-green-900 px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition transform hover:scale-105">
              <RotateCcw size={24} />Try Another
            </button>
            <button onClick={() => setGameState('menu')} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition transform hover:scale-105">
              <Play size={24} />Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'lost') {
    const currentFields = getCurrentFields();
    const career = currentFields[selectedField].subfields[selectedCareer];
    
    // Count distraction occurrences
    const distractionCount = {};
    hitDistractions.forEach(d => {
      distractionCount[d] = (distractionCount[d] || 0) + 1;
    });
    const topDistractions = Object.entries(distractionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center p-8 overflow-y-auto">
        <div className="text-center max-w-3xl my-8">
          <h1 className="text-6xl font-bold text-white mb-6">Career Setback!</h1>
          <p className="text-3xl text-red-200 mb-4">
            Hit the boundary! Game Over!
          </p>
          <p className="text-2xl text-red-300 mb-4">Reached milestone {currentNode} of {career.nodes.length}</p>
          <p className="text-5xl font-bold text-yellow-400 mb-8">Final Score: {score}</p>
          
          {topDistractions.length > 0 && (
            <div className="bg-slate-800 rounded-2xl p-8 mb-8 border-2 border-red-400">
              <h2 className="text-3xl font-bold text-white mb-6">⚠️ Distractions You Encountered</h2>
              <div className="space-y-4 text-left">
                {topDistractions.map(([name, count]) => {
                  const distraction = distractionTypes.find(d => d.name === name);
                  return (
                    <div key={name} className="bg-slate-700 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{distraction?.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {name} <span className="text-red-400">({count}x)</span>
                          </h3>
                          <p className="text-gray-300 text-sm">{distraction?.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-blue-900 rounded-lg">
                <p className="text-white text-lg font-semibold mb-2">💡 Career Wisdom</p>
                <p className="text-blue-200 text-base">
                  Success requires discipline and focus. Every distraction costs you opportunities, 
                  time, and progress. Stay committed to your goals and avoid shortcuts that lead nowhere.
                </p>
              </div>
            </div>
          )}
          
          <button onClick={resetGame} className="bg-white hover:bg-gray-100 text-red-900 px-8 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto transition transform hover:scale-105">
            <RotateCcw size={24} />Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Class10CareerGame;