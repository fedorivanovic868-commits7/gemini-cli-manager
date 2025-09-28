'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, BookOpen, Edit, Trash2, File, BarChart3 } from 'lucide-react';
import type { TranslationTitle } from '@/lib/db';

export function TranslationsTab() {
  const [translations, setTranslations] = useState<TranslationTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<TranslationTitle | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    totalChapters: 0,
    translatedChapters: 0,
    status: 'Нужен перевод' as TranslationTitle['status'],
  });

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const response = await fetch('/api/translations');
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      } else {
        toast.error('Ошибка загрузки переводов');
      }
    } catch {
      toast.error('Ошибка загрузки переводов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('totalChapters', formData.totalChapters.toString());
      formDataToSend.append('translatedChapters', formData.translatedChapters.toString());
      formDataToSend.append('status', formData.status);
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      const response = await fetch('/api/translations', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Тайтл успешно создан');
        fetchTranslations();
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка создания тайтла');
      }
    } catch {
      toast.error('Произошла ошибка при создании тайтла');
    }
  };

  const handleEdit = async () => {
    if (!editingTranslation) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', editingTranslation.id.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('totalChapters', formData.totalChapters.toString());
      formDataToSend.append('translatedChapters', formData.translatedChapters.toString());
      formDataToSend.append('status', formData.status);
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      const response = await fetch('/api/translations', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Тайтл успешно обновлен');
        fetchTranslations();
        setIsEditDialogOpen(false);
        setEditingTranslation(null);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка обновления тайтла');
      }
    } catch {
      toast.error('Произошла ошибка при обновлении тайтла');
    }
  };

  const handleDelete = async (translation: TranslationTitle) => {
    if (!confirm(`Вы уверены, что хотите удалить тайтл "${translation.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/translations?id=${translation.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Тайтл успешно удален');
        fetchTranslations();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка удаления тайтла');
      }
    } catch {
      toast.error('Произошла ошибка при удалении тайтла');
    }
  };

  const openEditDialog = (translation: TranslationTitle) => {
    setEditingTranslation(translation);
    setFormData({
      title: translation.title,
      totalChapters: translation.totalChapters,
      translatedChapters: translation.translatedChapters,
      status: translation.status,
    });
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      totalChapters: 0,
      translatedChapters: 0,
      status: 'Нужен перевод',
    });
    setSelectedFile(null);
  };

  const getStatusColor = (status: TranslationTitle['status']) => {
    switch (status) {
      case 'Нужен перевод':
        return 'text-red-500';
      case 'В переводе':
        return 'text-yellow-500';
      case 'Переведено':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getProgressPercentage = (translated: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((translated / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Загрузка переводов...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Управление переводами</h2>
          <p className="text-muted-foreground">
            Отслеживайте прогресс перевода книг и управляйте тайтлами
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить тайтл
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать новый тайтл</DialogTitle>
              <DialogDescription>
                Добавьте новую книгу для отслеживания прогресса перевода
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название книги"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalChapters">Всего глав</Label>
                  <Input
                    id="totalChapters"
                    type="number"
                    min="0"
                    value={formData.totalChapters}
                    onChange={(e) => setFormData({ ...formData, totalChapters: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="translatedChapters">Переведено глав</Label>
                  <Input
                    id="translatedChapters"
                    type="number"
                    min="0"
                    max={formData.totalChapters}
                    value={formData.translatedChapters}
                    onChange={(e) => setFormData({ ...formData, translatedChapters: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as TranslationTitle['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Нужен перевод">Нужен перевод</SelectItem>
                    <SelectItem value="В переводе">В переводе</SelectItem>
                    <SelectItem value="Переведено">Переведено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Файл для анализа (необязательно)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Загрузите .txt файл для автоматического анализа количества символов и слов
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreate}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Translations Grid */}
      {translations.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground mb-4">Тайтлы не найдены</div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Создать первый тайтл
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {translations.map((translation) => {
            const progress = getProgressPercentage(translation.translatedChapters, translation.totalChapters);
            return (
              <Card key={translation.id} className="relative">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg pr-2 break-words">{translation.title}</CardTitle>
                      <CardDescription>
                        Создано: {new Date(translation.createdAt).toLocaleDateString('ru-RU')}
                      </CardDescription>
                    </div>
                    <div className={`text-sm font-medium ${getStatusColor(translation.status)} flex-shrink-0`}>
                      {translation.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Прогресс</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{translation.translatedChapters} переведено</span>
                        <span>{translation.totalChapters} всего</span>
                      </div>
                    </div>

                    {/* File Analysis */}
                    {translation.fileName && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <File className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{translation.fileName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {translation.fileCharCount && (
                            <div>
                              <BarChart3 className="w-3 h-3 inline mr-1" />
                              {translation.fileCharCount.toLocaleString()} симв.
                            </div>
                          )}
                          {translation.fileWordCount && (
                            <div>
                              {translation.fileWordCount.toLocaleString()} слов
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(translation)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Изменить</span>
                        <span className="sm:hidden">Изм.</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(translation)}
                        className="text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать тайтл</DialogTitle>
            <DialogDescription>
              Измените параметры тайтла
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Название</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название книги"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-totalChapters">Всего глав</Label>
                <Input
                  id="edit-totalChapters"
                  type="number"
                  min="0"
                  value={formData.totalChapters}
                  onChange={(e) => setFormData({ ...formData, totalChapters: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-translatedChapters">Переведено глав</Label>
                <Input
                  id="edit-translatedChapters"
                  type="number"
                  min="0"
                  max={formData.totalChapters}
                  value={formData.translatedChapters}
                  onChange={(e) => setFormData({ ...formData, translatedChapters: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TranslationTitle['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Нужен перевод">Нужен перевод</SelectItem>
                  <SelectItem value="В переводе">В переводе</SelectItem>
                  <SelectItem value="Переведено">Переведено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-file">Обновить файл (необязательно)</Label>
              <Input
                id="edit-file"
                type="file"
                accept=".txt"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Загрузите новый .txt файл, чтобы обновить анализ
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}