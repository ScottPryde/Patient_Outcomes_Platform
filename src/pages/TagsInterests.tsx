import { useState } from 'react';
import { mockTags } from '../lib/mockData';
import { Tags, Search, Plus, Check } from 'lucide-react';

export function TagsInterests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [followedTags, setFollowedTags] = useState<Set<string>>(new Set(['tag-1', 'tag-4']));

  const categories = ['all', ...new Set(mockTags.map(t => t.category))];

  const filteredTags = mockTags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFollow = (tagId: string) => {
    setFollowedTags(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'therapy-area': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'condition': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'treatment': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'research-theme': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'modality': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Tags & Interests</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow topics to receive personalized trial and research recommendations
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Tags className="w-10 h-10 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-200">
              You're following {followedTags.size} topics
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              We'll notify you when new trials or research match your interests
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map((tag) => {
          const isFollowing = followedTags.has(tag.id);
          
          return (
            <div
              key={tag.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(tag.category)}`}>
                  {tag.category.replace('-', ' ')}
                </span>
                <button
                  onClick={() => toggleFollow(tag.id)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isFollowing
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {isFollowing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>

              <h3 className="font-semibold mb-2">{tag.name}</h3>
              {tag.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tag.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
