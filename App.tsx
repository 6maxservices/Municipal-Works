
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Screen, UserRole, Project, ProjectStatus, ArticleStatus, ImageFile, ProjectData, ImagePair, DashboardView } from './types';
import { UploadIcon, LocationIcon, TrashIcon, CheckCircleIcon, SpinnerIcon, UserIcon, EditIcon, ClipboardCheckIcon, HomeIcon, LogoutIcon, DocumentTextIcon, GlobeAltIcon, KorydallosLogo } from './components/icons';

// --- Reusable Components ---
const Button: React.FC<{
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}> = ({ onClick, children, variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = 'px-4 py-2 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}>
      {children}
    </button>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`bg-white rounded-xl shadow-lg p-6 md:p-8 w-full ${className}`}>{children}</div>;
};

const StatusBadge: React.FC<{ status: ProjectStatus | ArticleStatus }> = ({ status }) => {
    const statusColors: Record<ProjectStatus | ArticleStatus, string> = {
        [ProjectStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
        [ProjectStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
        [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800',
        [ArticleStatus.NONE]: 'bg-gray-100 text-gray-800',
        [ArticleStatus.DRAFT]: 'bg-indigo-100 text-indigo-800',
        [ArticleStatus.PENDING_APPROVAL]: 'bg-orange-100 text-orange-800',
        [ArticleStatus.APPROVED]: 'bg-teal-100 text-teal-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
            {status}
        </span>
    );
};

// --- Screen Components ---

const LandingPage: React.FC<{ onSelectRole: (role: UserRole) => void }> = ({ onSelectRole }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-gray-100">
            <div 
                className="absolute inset-0 bg-cover bg-center z-0" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549882236-5813b5a76483?q=80&w=2070&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>
            
            <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
                <Card className="!p-8 md:!p-12 bg-white/90 backdrop-blur-lg">
                    <div className="text-center space-y-6">
                        <KorydallosLogo className="h-20 w-auto mx-auto text-[#005A3A]" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Municipal Works <span className="text-blue-600">Media Assistant</span>
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg">
                            Ένα σύγχρονο εργαλείο για την άμεση προβολή των έργων του Δήμου μας. Καταγράψτε, δημιουργήστε, εγκρίνετε.
                        </p>
                        <div className="pt-4 border-t border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Επιλέξτε τον Ρόλο σας</h2>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => onSelectRole(UserRole.INSPECTOR)} className="w-full sm:w-auto px-8 py-3 text-base">
                                    <UserIcon className="w-5 h-5" />
                                    Επιθεωρητής
                                </Button>
                                <Button onClick={() => onSelectRole(UserRole.SUPERVISOR)} variant="secondary" className="w-full sm:w-auto px-8 py-3 text-base">
                                    <UserIcon className="w-5 h-5" />
                                    Επόπτης
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const DashboardScreen: React.FC<{
    projects: Project[];
    title: string;
    userRole: UserRole;
    onCreateArticle: (projectId: number) => void;
    onReviewArticle: (projectId: number) => void;
}> = ({ projects, title, userRole, onCreateArticle, onReviewArticle }) => (
    <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        {projects.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {projects.map(project => (
                        <li key={project.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-grow">
                                    <h2 className="text-lg font-bold text-gray-800">{project.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">{project.location}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <StatusBadge status={project.projectStatus} />
                                        <StatusBadge status={project.articleStatus} />
                                    </div>
                                </div>
                                <div className="flex-shrink-0 w-full sm:w-auto">
                                    {userRole === UserRole.INSPECTOR && project.articleStatus === ArticleStatus.NONE && project.projectStatus === ProjectStatus.COMPLETED && (
                                        <Button onClick={() => onCreateArticle(project.id)} className="w-full">
                                            <EditIcon /> Δημιουργία Άρθρου
                                        </Button>
                                    )}
                                    {userRole === UserRole.SUPERVISOR && project.articleStatus === ArticleStatus.PENDING_APPROVAL && (
                                        <Button onClick={() => onReviewArticle(project.id)} className="w-full">
                                            <ClipboardCheckIcon /> Αξιολόγηση
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <Card>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-700">Δεν βρέθηκαν έργα</h2>
                    <p className="mt-2 text-gray-500">Δεν υπάρχουν έργα που να ταιριάζουν σε αυτήν την προβολή.</p>
                </div>
            </Card>
        )}
    </div>
);


const UploadScreen: React.FC<{ onUpload: (data: Omit<ProjectData, 'projectType' | 'keyPoints' | 'articleTitle' | 'articleSubtitle' | 'articleBody' | 'imagePairs' | 'service' | 'date'>) => void; project: Project }> = ({ onUpload, project }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ name: string; coords: { lat: number; lng: number } } | null>(null);

  useEffect(() => {
    // Pre-fill location from project data
    setLocation({ name: project.location, coords: { lat: 37.9756, lng: 23.7345 } });
  }, [project]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 6 - images.length);
      const newImages: ImageFile[] = files.map((file: File) => ({ id: Date.now() + Math.random(), file, previewUrl: URL.createObjectURL(file) }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: number) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };
  
  const canSubmit = images.length > 0 && images.length % 2 === 0 && description.trim().length > 0 && location !== null;

  const handleSubmit = () => {
    if (!canSubmit || !location) return;
    onUpload({ description, location, images });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Αναφορά για το Έργο: "{project.name}"</h1>
      <Card>
        <div className="space-y-4">
          <label htmlFor="description" className="block text-lg font-medium text-gray-700">Σύντομη Περιγραφή Συνεργείου</label>
          <textarea id="description" rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="π.χ. Αποκατάσταση οδοστρώματος..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </Card>
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700">Φωτογραφίες (έως 6, σε ζευγάρια Πριν/Μετά)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {images.map(img => (
              <div key={img.id} className="relative aspect-square group">
                <img src={img.previewUrl} alt="preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
             {images.length < 6 && (
              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <UploadIcon className="w-10 h-10 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Προσθήκη</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} />
              </label>
            )}
          </div>
           {images.length > 0 && images.length % 2 !== 0 && (
              <p className="text-sm text-red-600 text-center mt-2">Παρακαλώ ανεβάστε τις φωτογραφίες σε ζευγάρια (Πριν/Μετά).</p>
            )}
        </div>
      </Card>
      <Card>
          <div className="flex items-center gap-3">
            <LocationIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-700">Τοποθεσία</h2>
              <p className="text-gray-600">{location?.name}</p>
            </div>
          </div>
      </Card>
      <div className="pt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={!canSubmit}>Υποβολή στο Pipeline</Button>
      </div>
    </div>
  );
};

const ProcessingScreen: React.FC<{ onComplete: (processedData: Partial<ProjectData>) => void }> = ({ onComplete }) => {
  const steps = useMemo(() => [
    "Ανίχνευση τύπου έργου (π.χ. οδοποιία)",
    "Ομαδοποίηση εικόνων σε Πριν/Μετά",
    "Αυτόματη δημιουργία λεζάντας ανά εικόνα",
    "Εξαγωγή σημείων-κλειδιών (Key Points)"
  ], []);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => setCurrentStep(s => s + 1), 1500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete({
          projectType: 'Οδοποιία',
          keyPoints: ["Αποκατάσταση φθορών", "Βελτίωση ασφάλειας"],
          articleTitle: "Παρέμβαση στην Πλατεία Συντάγματος",
          articleSubtitle: "Βελτίωση της ασφάλειας και ποιότητας του οδοστρώματος",
          articleBody: "Ολοκληρώθηκαν οι εργασίες αποκατάστασης του οδοστρώματος στην κεντρική Πλατεία Συντάγματος. Η παρέμβαση αποσκοπούσε στην επισκευή των φθορών, διασφαλίζοντας την ασφαλή διέλευση οχημάτων και πεζών.\n\nΟι ομάδες της Τεχνικής Υπηρεσίας προχώρησαν στην τοποθέτηση νέου ασφαλτικού τάπητα υψηλής αντοχής, συμβάλλοντας στην αναβάθμιση της εικόνας του κέντρου της πόλης.",
          service: 'Τεχνική Υπηρεσία',
          date: new Date().toLocaleDateString('el-GR'),
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800">Επεξεργασία AI</h1>
      <SpinnerIcon className="w-16 h-16 text-blue-600" />
      <Card className="w-full max-w-lg">
        <ul className="space-y-4">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3 text-lg">
              {currentStep > index ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <SpinnerIcon className={`w-6 h-6 text-blue-500 ${currentStep === index ? 'opacity-100' : 'opacity-0'}`} />}
              <span className={`${currentStep > index ? 'text-gray-800' : 'text-gray-500'}`}>{step}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

const DraftArticleScreen: React.FC<{ projectData: ProjectData; onSubmitForApproval: () => void; onUpdateBody: (newBody: string) => void }> = ({ projectData, onSubmitForApproval, onUpdateBody }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(projectData.articleBody);

  useEffect(() => { setEditedBody(projectData.articleBody); }, [projectData.articleBody]);
  const handleSaveChanges = () => { onUpdateBody(editedBody); setIsEditing(false); };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Προσχέδιο Άρθρου</h1>
      <Card>
        <div className="space-y-6">
          <header className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">{projectData.articleTitle}</h2>
            <p className="text-lg text-gray-600 mt-1">{projectData.articleSubtitle}</p>
          </header>
          <article className="prose max-w-none text-gray-700">
            {isEditing ? <textarea value={editedBody} onChange={(e) => setEditedBody(e.target.value)} className="w-full p-3 border rounded-lg min-h-[250px] text-base" rows={12}/> : <div className="whitespace-pre-line">{projectData.articleBody}</div>}
          </article>
          <section>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Gallery: Πριν & Μετά</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectData.imagePairs.map((pair, index) => (
                <div key={index} className="space-y-4">
                  <div className="bg-gray-100 p-2 rounded-lg"><img src={pair.before.url} alt="Πριν" className="w-full rounded" /><p className="text-center text-sm font-medium mt-2">{pair.before.caption}</p></div>
                  <div className="bg-gray-100 p-2 rounded-lg"><img src={pair.after.url} alt="Μετά" className="w-full rounded" /><p className="text-center text-sm font-medium mt-2">{pair.after.caption}</p></div>
                </div>
              ))}
            </div>
          </section>
          <aside className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Πληροφορίες Έργου</h3>
            <div className="space-y-2 text-gray-600"><p><strong>Περιοχή:</strong> {projectData.location.name}</p><p><strong>Ημερομηνία:</strong> {projectData.date}</p><p><strong>Υπηρεσία:</strong> {projectData.service}</p></div>
          </aside>
          <footer className="pt-4 border-t flex flex-col sm:flex-row items-center justify-end gap-4">
            {isEditing ? <Button onClick={handleSaveChanges}>Αποθήκευση</Button> : <Button onClick={() => setIsEditing(true)} variant="secondary">Επεξεργασία</Button>}
            <Button onClick={onSubmitForApproval} disabled={isEditing}>Υποβολή για Έγκριση</Button>
          </footer>
        </div>
      </Card>
    </div>
  );
};

const ApprovalScreen: React.FC<{ projectData: ProjectData; onFinalApprove: () => void; onSendBack: () => void }> = ({ projectData, onFinalApprove, onSendBack }) => {
  const [isApproved, setIsApproved] = useState(false);
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Αξιολόγηση Άρθρου</h1>
      <Card className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900">{projectData.articleTitle}</h2>
        <p className="text-md text-gray-600 mt-1">{projectData.articleSubtitle}</p>
        <div className="mt-4 border-t pt-4 text-sm text-gray-500"><p><strong>Υποβλήθηκε από:</strong> Επιθεωρητής ({projectData.service})</p><p><strong>Ημερομηνία:</strong> {projectData.date}</p></div>
        <div className="mt-4 whitespace-pre-line border-t pt-4">{projectData.articleBody}</div>
      </Card>
      <Card className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <label htmlFor="approval-toggle" className="text-lg font-medium text-gray-700">Έγκριση Δημοσίευσης</label>
          <button id="approval-toggle" onClick={() => setIsApproved(!isApproved)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isApproved ? 'bg-blue-600' : 'bg-gray-200'}`} aria-pressed={isApproved}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isApproved ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </Card>
      <div className="pt-4 flex justify-end gap-4">
        <Button onClick={onSendBack} variant="secondary">Απόρριψη</Button>
        <Button onClick={onFinalApprove} disabled={!isApproved}>Οριστική Έγκριση</Button>
      </div>
    </div>
  );
};

const ConfirmationScreen: React.FC<{ onPreview: () => void; onBackToDashboard: () => void }> = ({ onPreview, onBackToDashboard }) => {
  return (
    <div className="text-center space-y-6 animate-fade-in-up">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center"><CheckCircleIcon className="w-12 h-12 text-green-600" /></div>
        <h1 className="text-3xl font-bold text-gray-800">Εγκρίθηκε!</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Το άρθρο είναι έτοιμο για δημοσίευση στο site του Δήμου.</p>
        <div className="pt-4 flex justify-center gap-4">
            <Button onClick={onPreview} variant="secondary">Προεπισκόπηση HTML</Button>
            <Button onClick={onBackToDashboard}>Επιστροφή στο Dashboard</Button>
        </div>
    </div>
  );
};

const PreviewScreen: React.FC<{ projectData: ProjectData; onClose: () => void }> = ({ projectData, onClose }) => (
    <div className="bg-gray-100 p-4 sm:p-6 md:p-8 rounded-lg animate-fade-in-up">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <header className="p-6 md:p-8 border-b"><p className="text-sm text-blue-600 font-semibold uppercase">{projectData.projectType}</p><h1 className="text-3xl md:text-4xl font-bold mt-2">{projectData.articleTitle}</h1><p className="text-lg text-gray-600 mt-2">{projectData.articleSubtitle}</p><div className="mt-4 text-xs text-gray-500"><span>Δημοσιεύτηκε στις {projectData.date}</span> | <span>Υπηρεσία: {projectData.service}</span></div></header>
            {projectData.imagePairs.length > 0 && <img src={projectData.imagePairs[0].after.url} alt={projectData.imagePairs[0].after.caption} className="w-full h-auto object-cover" />}
            <article className="p-6 md:p-8 prose prose-lg max-w-none">{projectData.articleBody.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</article>
            <section className="p-6 md:p-8 bg-gray-50 border-t"><h2 className="text-2xl font-bold text-center mb-6">Gallery: Πριν & Μετά</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-8">{projectData.imagePairs.map((pair, i) => (<div key={i} className="text-center"><figure><img src={pair.before.url} alt={pair.before.caption} className="w-full rounded-lg shadow-md mb-2" /><figcaption className="text-sm italic">Πριν: {pair.before.caption}</figcaption></figure><figure className="mt-4"><img src={pair.after.url} alt={pair.after.caption} className="w-full rounded-lg shadow-md mb-2" /><figcaption className="text-sm italic">Μετά: {pair.after.caption}</figcaption></figure></div>))}</div></section>
        </div>
        <div className="text-center mt-8"><Button onClick={onClose} variant="secondary">Κλείσιμο Προεπισκόπησης</Button></div>
    </div>
);

const NavLink: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode; }> = ({ onClick, isActive, children }) => {
    const baseClasses = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors';
    const activeClasses = 'bg-blue-100 text-blue-700';
    const inactiveClasses = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};

// --- Main App Component ---
const DUMMY_PROJECTS: Project[] = [
    { id: 1, name: 'Αποκατάσταση Οδοστρώματος - Οδός Α', location: 'Κέντρο Πόλης', projectStatus: ProjectStatus.COMPLETED, articleStatus: ArticleStatus.NONE },
    { 
      id: 2, name: 'Κλάδεμα Δέντρων - Πάρκο Β', location: 'Περιοχή Β', projectStatus: ProjectStatus.COMPLETED, articleStatus: ArticleStatus.PENDING_APPROVAL,
      articleData: {
        description: 'Annual pruning of trees in Park B to ensure safety and health of the flora.',
        location: { name: 'Περιοχή Β', coords: { lat: 38.000, lng: 23.750 } },
        images: [],
        projectType: 'Πράσινο',
        keyPoints: ["Κλάδεμα ψηλών δέντρων", "Απομάκρυνση ξερών κλαδιών"],
        articleTitle: "Εργασίες συντήρησης στο Πάρκο Β",
        articleSubtitle: "Ολοκληρώθηκε το ετήσιο κλάδεμα για την ασφάλεια των επισκεπτών",
        articleBody: "Οι υπηρεσίες πρασίνου του Δήμου ολοκλήρωσαν τις προγραμματισμένες εργασίες κλαδέματος στο Πάρκο Β. Η παρέμβαση κρίθηκε αναγκαία για την απομάκρυνση επικίνδυνων κλαδιών και τη διατήρηση της υγείας των δέντρων.\n\nΟι εργασίες συμβάλλουν στη βελτίωση της αισθητικής του πάρκου και στην ασφαλή παραμονή των δημοτών στους χώρους αναψυχής.",
        imagePairs: [],
        service: 'Υπηρεσία Πρασίνου',
        date: '15/05/2024',
      }
    },
    { id: 3, name: 'Επισκευή Παιδικής Χαράς - Πλατεία Γ', location: 'Περιοχή Γ', projectStatus: ProjectStatus.IN_PROGRESS, articleStatus: ArticleStatus.NONE },
    { 
      id: 4, name: 'Αντικατάσταση Φωτισμού LED - Λεωφόρος Δ', location: 'Περιοχή Δ', projectStatus: ProjectStatus.COMPLETED, articleStatus: ArticleStatus.APPROVED,
      articleData: {
        description: 'Replacement of old street lights with new energy-efficient LED lights on Avenue D.',
        location: { name: 'Περιοχή Δ', coords: { lat: 37.950, lng: 23.700 } },
        images: [],
        projectType: 'Ηλεκτροφωτισμός',
        keyPoints: ["Εξοικονόμηση ενέργειας", "Βελτίωση ορατότητας"],
        articleTitle: "Νέος, σύγχρονος φωτισμός LED στη Λεωφόρο Δ",
        articleSubtitle: "Αναβαθμίζεται ο φωτισμός για μεγαλύτερη ασφάλεια και εξοικονόμηση ενέργειας",
        articleBody: "Ολοκληρώθηκε με επιτυχία το έργο αντικατάστασης των παλαιών φωτιστικών σωμάτων με νέας τεχνολογίας LED στη Λεωφόρο Δ. Η αναβάθμιση του δικτύου ηλεκτροφωτισμού θα προσφέρει καλύτερη ορατότητα κατά τις νυχτερινές ώρες, αυξάνοντας το αίσθημα ασφάλειας για οδηγούς και πεζούς.\n\nΠαράλληλα, η χρήση λαμπτήρων LED θα μειώσει σημαντικά την κατανάλωση ενέργειας, με θετικό περιβαλλοντικό και οικονομικό αποτύπωμα για τον Δήμο.",
        imagePairs: [],
        service: 'Τεχνική Υπηρεσία',
        date: '10/04/2024',
      }
    },
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.ROLE_SELECTION);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<DashboardView>(DashboardView.ALL);

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId) || null, [projects, selectedProjectId]);
  const articleDataForSelectedProject = useMemo(() => selectedProject?.articleData || null, [selectedProject]);
  
  const filteredProjects = useMemo(() => {
    switch (currentView) {
      case DashboardView.MY_ARTICLES:
        return projects.filter(p => p.articleStatus !== ArticleStatus.NONE);
      case DashboardView.PENDING_APPROVAL:
        return projects.filter(p => p.articleStatus === ArticleStatus.PENDING_APPROVAL);
      case DashboardView.APPROVED:
        return projects.filter(p => p.articleStatus === ArticleStatus.APPROVED);
      case DashboardView.ALL:
      default:
        return projects;
    }
  }, [projects, currentView]);

  const updateProject = (projectId: number, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };
  
  const handleNavigate = (view: DashboardView) => {
    setCurrentView(view);
    setScreen(Screen.DASHBOARD);
  };

  const handleSelectRole = (role: UserRole) => { setCurrentUserRole(role); handleNavigate(DashboardView.ALL); };
  const handleCreateArticle = (projectId: number) => { setSelectedProjectId(projectId); setScreen(Screen.UPLOAD); };
  const handleReviewArticle = (projectId: number) => { setSelectedProjectId(projectId); setScreen(Screen.APPROVAL); };
  const handleBackToDashboard = () => { setSelectedProjectId(null); handleNavigate(DashboardView.ALL); };
  const handleLogout = () => {
      setCurrentUserRole(null);
      setSelectedProjectId(null);
      setScreen(Screen.ROLE_SELECTION);
  };
  
  const handleUpload = useCallback((data: Omit<ProjectData, 'projectType' | 'keyPoints' | 'articleTitle' | 'articleSubtitle' | 'articleBody' | 'imagePairs' | 'service' | 'date'>) => {
    if (!selectedProjectId) return;
    const pairs: ImagePair[] = [];
    for (let i = 0; i < data.images.length; i += 2) {
      const beforeImg = data.images[i], afterImg = data.images[i + 1];
      if (beforeImg && afterImg) {
        pairs.push({
          before: { id: beforeImg.id, url: beforeImg.previewUrl, caption: 'Επισκευή ρωγμής' },
          after: { id: afterImg.id, url: afterImg.previewUrl, caption: 'Νέος ασφαλτικός τάπητας' },
        });
      }
    }
    const newArticleData: Partial<ProjectData> = { description: data.description, location: data.location!, images: data.images, imagePairs: pairs };
    updateProject(selectedProjectId, { 
      articleData: { ...projects.find(p => p.id === selectedProjectId)?.articleData, ...newArticleData } as ProjectData,
      articleStatus: ArticleStatus.DRAFT 
    });
    setScreen(Screen.PROCESSING);
  }, [selectedProjectId, projects]);

  const handleProcessingComplete = useCallback((processedData: Partial<ProjectData>) => {
    if (!selectedProjectId) return;
    updateProject(selectedProjectId, { articleData: { ...projects.find(p => p.id === selectedProjectId)!.articleData!, ...processedData } });
    setScreen(Screen.DRAFT);
  }, [selectedProjectId, projects]);

  const handleUpdateBody = useCallback((newBody: string) => {
    if (!selectedProjectId || !articleDataForSelectedProject) return;
    updateProject(selectedProjectId, { articleData: { ...articleDataForSelectedProject, articleBody: newBody } });
  }, [selectedProjectId, articleDataForSelectedProject]);
  
  const handleSubmitForApproval = () => { if(selectedProjectId) updateProject(selectedProjectId, { articleStatus: ArticleStatus.PENDING_APPROVAL }); handleBackToDashboard(); };
  const handleSendBack = () => { if(selectedProjectId) updateProject(selectedProjectId, { articleStatus: ArticleStatus.DRAFT }); handleBackToDashboard(); };
  const handleFinalApprove = () => { if(selectedProjectId) updateProject(selectedProjectId, { articleStatus: ArticleStatus.APPROVED }); setScreen(Screen.CONFIRMATION); };
  const handlePreview = () => setScreen(Screen.PREVIEW);
  const handleClosePreview = () => setScreen(Screen.CONFIRMATION);

  const renderScreen = () => {
    switch (screen) {
      case Screen.DASHBOARD: return <DashboardScreen projects={filteredProjects} title={currentView} userRole={currentUserRole!} onCreateArticle={handleCreateArticle} onReviewArticle={handleReviewArticle} />;
      case Screen.UPLOAD: return <UploadScreen onUpload={handleUpload} project={selectedProject!} />;
      case Screen.PROCESSING: return <ProcessingScreen onComplete={handleProcessingComplete} />;
      case Screen.DRAFT: return <DraftArticleScreen projectData={articleDataForSelectedProject!} onSubmitForApproval={handleSubmitForApproval} onUpdateBody={handleUpdateBody} />;
      case Screen.APPROVAL: return <ApprovalScreen projectData={articleDataForSelectedProject!} onFinalApprove={handleFinalApprove} onSendBack={handleSendBack} />;
      case Screen.CONFIRMATION: return <ConfirmationScreen onPreview={handlePreview} onBackToDashboard={handleBackToDashboard} />;
      case Screen.PREVIEW: return <PreviewScreen projectData={articleDataForSelectedProject!} onClose={handleClosePreview} />;
      default: return null;
    }
  };

  if (screen === Screen.ROLE_SELECTION) {
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      <style>{`.animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-100 via-indigo-50 to-white -z-10"></div>
      
      {currentUserRole && (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
               <div className="flex-shrink-0">
                  <span className="text-xl md:text-2xl font-bold text-blue-800">Municipal Works</span>
               </div>
               <div className="hidden md:flex items-center gap-2">
                    <NavLink onClick={() => handleNavigate(DashboardView.ALL)} isActive={currentView === DashboardView.ALL}><HomeIcon className="w-5 h-5" /> {DashboardView.ALL}</NavLink>
                    {currentUserRole === UserRole.INSPECTOR && <NavLink onClick={() => handleNavigate(DashboardView.MY_ARTICLES)} isActive={currentView === DashboardView.MY_ARTICLES}><DocumentTextIcon className="w-5 h-5" /> {DashboardView.MY_ARTICLES}</NavLink>}
                    {currentUserRole === UserRole.SUPERVISOR && <NavLink onClick={() => handleNavigate(DashboardView.PENDING_APPROVAL)} isActive={currentView === DashboardView.PENDING_APPROVAL}><ClipboardCheckIcon className="w-5 h-5" /> {DashboardView.PENDING_APPROVAL}</NavLink>}
                    <NavLink onClick={() => handleNavigate(DashboardView.APPROVED)} isActive={currentView === DashboardView.APPROVED}><GlobeAltIcon className="w-5 h-5" /> {DashboardView.APPROVED}</NavLink>
               </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 hidden sm:block">
                  Ρόλος: <strong className="font-semibold text-gray-900">{currentUserRole}</strong>
                </span>
                <Button onClick={handleLogout} variant="secondary" className="!p-2 !rounded-full">
                  <LogoutIcon className="w-5 h-5"/>
                </Button>
              </div>
            </div>
            <div className="md:hidden flex items-center justify-around gap-1 border-t border-gray-200 py-2">
                <NavLink onClick={() => handleNavigate(DashboardView.ALL)} isActive={currentView === DashboardView.ALL}><HomeIcon className="w-5 h-5" /></NavLink>
                {currentUserRole === UserRole.INSPECTOR && <NavLink onClick={() => handleNavigate(DashboardView.MY_ARTICLES)} isActive={currentView === DashboardView.MY_ARTICLES}><DocumentTextIcon className="w-5 h-5" /></NavLink>}
                {currentUserRole === UserRole.SUPERVISOR && <NavLink onClick={() => handleNavigate(DashboardView.PENDING_APPROVAL)} isActive={currentView === DashboardView.PENDING_APPROVAL}><ClipboardCheckIcon className="w-5 h-5" /></NavLink>}
                <NavLink onClick={() => handleNavigate(DashboardView.APPROVED)} isActive={currentView === DashboardView.APPROVED}><GlobeAltIcon className="w-5 h-5" /></NavLink>
            </div>
          </nav>
        </header>
      )}

      <main className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 ${currentUserRole ? 'pt-8' : 'pt-20'}`}>
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
