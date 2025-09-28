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
import { Plus, Edit, Trash2, Download, Upload, Circle } from 'lucide-react';
import type { Session } from '@/lib/db';

export function SessionsTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSessionName, setImportSessionName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    variable: '',
    status: 'Свободно' as Session['status'],
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        toast.error('Ошибка загрузки сессий');
      }
    } catch {
      toast.error('Ошибка загрузки сессий');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          variable: formData.variable,
        }),
      });

      if (response.ok) {
        toast.success('Сессия успешно создана');
        fetchSessions();
        setIsCreateDialogOpen(false);
        setFormData({ name: '', variable: '', status: 'Свободно' });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка создания сессии');
      }
    } catch {
      toast.error('Произошла ошибка при создании сессии');
    }
  };

  const handleEdit = async () => {
    if (!editingSession) return;

    try {
      const response = await fetch('/api/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingSession.id,
          name: formData.name,
          variable: formData.variable,
          status: formData.status,
        }),
      });

      if (response.ok) {
        toast.success('Сессия успешно обновлена');
        fetchSessions();
        setIsEditDialogOpen(false);
        setEditingSession(null);
        setFormData({ name: '', variable: '', status: 'Свободно' });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка обновления сессии');
      }
    } catch {
      toast.error('Произошла ошибка при обновлении сессии');
    }
  };

  const handleDelete = async (session: Session) => {
    if (!confirm(`Вы уверены, что хотите удалить сессию "${session.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions?id=${session.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Сессия успешно удалена');
        fetchSessions();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка удаления сессии');
      }
    } catch {
      toast.error('Произошла ошибка при удалении сессии');
    }
  };

  const handleStatusChange = async (session: Session, newStatus: Session['status']) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: session.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast.success('Статус сессии обновлен');
        fetchSessions();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка обновления статуса');
      }
    } catch {
      toast.error('Произошла ошибка при обновлении статуса');
    }
  };

  const openEditDialog = (session: Session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      variable: session.variable,
      status: session.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDownload = async (session: Session) => {
    try {
      const response = await fetch(`/api/sessions/export?sessionId=${session.id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.name.replace(/[^a-zA-Z0-9]/g, '_')}_session.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Сессия успешно экспортирована');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка экспорта сессии');
      }
    } catch {
      toast.error('Произошла ошибка при экспорте сессии');
    }
  };

  const handleImport = async () => {
    if (!importFile || !importSessionName) {
      toast.error('Выберите файл и введите название сессии');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('sessionName', importSessionName);

      const response = await fetch('/api/sessions/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Сессия успешно импортирована');
        fetchSessions();
        setIsImportDialogOpen(false);
        setImportFile(null);
        setImportSessionName('');
      } else {
        toast.error(result.error || 'Ошибка импорта сессии');
      }
    } catch {
      toast.error('Произошла ошибка при импорте сессии');
    }
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'Свободно':
        return 'text-green-500';
      case 'Используется':
        return 'text-yellow-500';
      case 'Истекла квота':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Загрузка сессий...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление сессиями</h2>
          <p className="text-muted-foreground">
            Управляйте сессиями Gemini CLI и отслеживайте их статусы
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить сессию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новую сессию</DialogTitle>
              <DialogDescription>
                Добавьте новую сессию Gemini CLI для управления
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Название сессии</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название сессии"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="variable">Переменная сессии</Label>
                <Input
                  id="variable"
                  value={formData.variable}
                  onChange={(e) => setFormData({ ...formData, variable: e.target.value })}
                  placeholder="Введите переменную сессии"
                />
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
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Импорт
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Импорт сессии</DialogTitle>
              <DialogDescription>
                Загрузите ZIP-архив с данными сессии
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="import-name">Название новой сессии</Label>
                <Input
                  id="import-name"
                  value={importSessionName}
                  onChange={(e) => setImportSessionName(e.target.value)}
                  placeholder="Введите название для импортируемой сессии"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="import-file">ZIP файл</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".zip"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleImport} disabled={!importFile || !importSessionName}>
                Импортировать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">Сессии не найдены</div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Создать первую сессию
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="relative">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-lg break-words">{session.name}</CardTitle>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Circle className={`w-3 h-3 fill-current ${getStatusColor(session.status)}`} />
                    <span className={`text-sm ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </div>
                <CardDescription>
                  Создано: {new Date(session.created_at).toLocaleDateString('ru-RU')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Переменная:</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                      {session.variable}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Статус:</Label>
                    <Select
                      value={session.status}
                      onValueChange={(value) => handleStatusChange(session, value as Session['status'])}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Свободно">Свободно</SelectItem>
                        <SelectItem value="Используется">Используется</SelectItem>
                        <SelectItem value="Истекла квота">Истекла квота</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(session)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Изменить</span>
                      <span className="sm:hidden">Изм.</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(session)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Скачать</span>
                      <span className="sm:hidden">Скач.</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(session)}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать сессию</DialogTitle>
            <DialogDescription>
              Измените параметры сессии
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Название сессии</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название сессии"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-variable">Переменная сессии</Label>
              <Input
                id="edit-variable"
                value={formData.variable}
                onChange={(e) => setFormData({ ...formData, variable: e.target.value })}
                placeholder="Введите переменную сессии"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Session['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Свободно">Свободно</SelectItem>
                  <SelectItem value="Используется">Используется</SelectItem>
                  <SelectItem value="Истекла квота">Истекла квота</SelectItem>
                </SelectContent>
              </Select>
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