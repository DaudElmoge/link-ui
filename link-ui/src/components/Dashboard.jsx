import { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash2,
  Pencil,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [expandSidebar, setExpandSidebar] = useState(false);
  const [trashedLinks, setTrashedLinks] = useState([]);
  const [showTrash, setShowTrash] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    url: "",
    description: "",
    category_id: "",
    newCategoryName: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      navigate("/login");
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    fetchCategories();

    const storedTrashedLinks =
      JSON.parse(localStorage.getItem("trashedLinks")) || [];
    const now = Date.now();
    const freshTrash = storedTrashedLinks.filter(
      (link) =>
        now - new Date(link.deletedAt).getTime() < 30 * 24 * 60 * 60 * 1000
    );
    const expiredTrash = storedTrashedLinks.filter(
      (link) =>
        now - new Date(link.deletedAt).getTime() >= 30 * 24 * 60 * 60 * 1000
    );

    expiredTrash.forEach(async (link) => {
      await axios.delete(`http://localhost:5000/links/${link.id}`);
    });

    setTrashedLinks(freshTrash);
    localStorage.setItem("trashedLinks", JSON.stringify(freshTrash));

    fetchLinks(freshTrash.map((l) => l.id));
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/categories");
    setCategories(res.data);
  };

  const fetchLinks = async (trashedIds = []) => {
    const res = await axios.get("http://localhost:5000/links");
    const activeLinks = res.data.filter(
      (link) => !trashedIds.includes(link.id)
    );
    setLinks(activeLinks);
    setFilteredLinks(activeLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalCategoryId = formData.category_id;

    if (!formData.category_id && formData.newCategoryName) {
      const res = await axios.post("http://localhost:5000/categories", {
        name: formData.newCategoryName,
      });
      finalCategoryId = res.data.id;
      await fetchCategories();
    }

    const payload = {
      title: formData.title,
      url: formData.url,
      description: formData.description,
      category_id: finalCategoryId,
    };

    if (isEdit) {
      await axios.patch(`http://localhost:5000/links/${formData.id}`, payload);
    } else {
      await axios.post("http://localhost:5000/links", payload);
    }

    setFormData({
      id: null,
      title: "",
      url: "",
      description: "",
      category_id: "",
      newCategoryName: "",
    });

    setShowModal(false);
    setIsEdit(false);
    const storedTrashedLinks =
      JSON.parse(localStorage.getItem("trashedLinks")) || [];
    fetchLinks(storedTrashedLinks.map((l) => l.id));
  };

  const handleDelete = async (id) => {
    const linkToDelete = links.find((link) => link.id === id);
    const updatedTrash = [
      ...trashedLinks,
      { ...linkToDelete, deletedAt: new Date().toISOString() },
    ];
    localStorage.setItem("trashedLinks", JSON.stringify(updatedTrash));
    setTrashedLinks(updatedTrash);
    const updatedLinks = links.filter((link) => link.id !== id);
    setLinks(updatedLinks);
    setFilteredLinks(
      updatedLinks.filter(
        (link) =>
          activeCategory === "All" || link.category_id === activeCategory
      )
    );
  };

  const handleEdit = (link) => {
    setFormData({
      ...link,
      newCategoryName: "",
    });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCategoryFilter = (catId) => {
    setActiveCategory(catId);
    setShowTrash(false);
    if (catId === "All") {
      setFilteredLinks(links);
    } else {
      setFilteredLinks(links.filter((link) => link.category_id === catId));
    }
  };

  const getLinkCount = (categoryId) =>
    links.filter((link) => link.category_id === categoryId).length;

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const handleLogout = () => {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleRestore = async (id) => {
    const link = trashedLinks.find((l) => l.id === id);
    if (!link) return;

    const updatedLinks = [...links, link];
    setLinks(updatedLinks);
    if (activeCategory === "All" || activeCategory === link.category_id) {
      setFilteredLinks([...filteredLinks, link]);
    }

    const updatedTrash = trashedLinks.filter((l) => l.id !== id);
    setTrashedLinks(updatedTrash);
    localStorage.setItem("trashedLinks", JSON.stringify(updatedTrash));
  };

  const handlePermanentDelete = async (id) => {
    const updatedTrash = trashedLinks.filter((link) => link.id !== id);
    setTrashedLinks(updatedTrash);
    localStorage.setItem("trashedLinks", JSON.stringify(updatedTrash));
    await axios.delete(`http://localhost:5000/links/${id}`);
  };

  const handleRestoreAll = () => {
    const updatedLinks = [...links, ...trashedLinks];
    setLinks(updatedLinks);

    if (activeCategory === "All") {
      setFilteredLinks(updatedLinks);
    }

    setTrashedLinks([]);
    localStorage.setItem("trashedLinks", JSON.stringify([]));
  };

  const handleEmptyTrash = async () => {
    for (let link of trashedLinks) {
      await axios.delete(`http://localhost:5000/links/${link.id}`);
    }
    setTrashedLinks([]);
    localStorage.setItem("trashedLinks", JSON.stringify([]));
  };

  return (
    <div className="min-h-screen bg-sky-400 flex flex-col">
      <header className="bg-white flex justify-between items-center px-6 py-4 shadow">
        <h1 className="text-3xl font-[cursive] text-black">Link App</h1>
        <button
          onClick={handleLogout}
          className="border border-sky-600 px-4 py-1 rounded hover:bg-blue-50 text-sm flex items-center gap-1 text-sky-700 cursor-pointer"
        >
          Log out
        </button>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-white p-4 shadow-md">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandSidebar(!expandSidebar)}
          >
            <h2 className="text-lg font-semibold mb-2">My Categories</h2>
            {expandSidebar ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </div>
          {expandSidebar && (
            <ul className="mt-2 space-y-2 text-sm text-gray-800">
              <li
                className={`flex justify-between cursor-pointer ${
                  activeCategory === "All" && !showTrash ? "font-bold" : ""
                }`}
                onClick={() => handleCategoryFilter("All")}
              >
                <span>All</span>
                <span>{links.length}</span>
              </li>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.id)}
                  className={`flex justify-between cursor-pointer ${
                    activeCategory === cat.id && !showTrash ? "font-bold" : ""
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-gray-500">{getLinkCount(cat.id)}</span>
                </li>
              ))}
            </ul>
          )}
          <div
            onClick={() => {
              setShowTrash(true);
              setActiveCategory("");
            }}
            className={`mt-6 flex items-center gap-2 text-red-600 cursor-pointer ${
              showTrash ? "font-bold" : ""
            }`}
          >
            <Trash size={18} />
            <span>Trash ({trashedLinks.length})</span>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 relative">
          {showTrash && (
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Trash</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreAll}
                  className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Restore All
                </button>
                <button
                  onClick={handleEmptyTrash}
                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Empty Trash
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {!showTrash
              ? filteredLinks.map((link) => (
                  <div
                    key={link.id}
                    className="bg-white p-4 rounded-xl shadow relative"
                  >
                    <h3 className="font-bold">{link.title}</h3>
                    <p className="text-xs text-gray-500">
                      {getCategoryName(link.category_id)}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      {link.description}
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Visit
                    </a>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Pencil
                        size={16}
                        className="text-blue-600 cursor-pointer"
                        onClick={() => handleEdit(link)}
                      />
                      <Trash2
                        size={16}
                        className="text-red-600 cursor-pointer"
                        onClick={() => handleDelete(link.id)}
                      />
                    </div>
                  </div>
                ))
              : trashedLinks.map((link) => (
                  <div
                    key={link.id}
                    className="bg-red-50 p-4 rounded-xl shadow relative"
                  >
                    <h3 className="font-bold text-red-800">{link.title}</h3>
                    <p className="text-xs text-red-600">
                      Trashed on {new Date(link.deletedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      {link.description}
                    </p>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="text-blue-600 text-sm underline"
                        onClick={() => handleRestore(link.id)}
                      >
                        Restore
                      </button>
                      <button
                        className="text-red-600 text-sm underline"
                        onClick={() => handlePermanentDelete(link.id)}
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </div>
                ))}
          </div>

          {!showTrash && (
            <button
              onClick={() => {
                setShowModal(true);
                setIsEdit(false);
                setFormData({
                  id: null,
                  title: "",
                  url: "",
                  description: "",
                  category_id: "",
                  newCategoryName: "",
                });
              }}
              className="fixed bottom-8 right-8 bg-white border border-blue-500 text-blue-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-500 hover:text-white transition cursor-pointer"
            >
              <Plus size={28} />
            </button>
          )}

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                  {isEdit ? "Edit Link" : "Add New Link"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <select
                    value={formData.category_id || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "new") {
                        setFormData({
                          ...formData,
                          category_id: "",
                          newCategoryName: "",
                        });
                      } else {
                        setFormData({
                          ...formData,
                          category_id: Number(value),
                          newCategoryName: "",
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {formData.category_id === "" && (
                    <input
                      type="text"
                      placeholder="New category name"
                      value={formData.newCategoryName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newCategoryName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md"
                    >
                      {isEdit ? "Update" : "Add Link"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
