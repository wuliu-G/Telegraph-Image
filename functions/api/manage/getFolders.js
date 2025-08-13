// Copyright (c) 2025 左岚. All rights reserved.
export async function onRequest(context) {
    const { env } = context;
    
    try {
        // 获取所有文件夹
        const folderList = await env.img_url.list({ prefix: 'folder_' });
        
        const folders = folderList.keys
            .filter(key => key.metadata && key.metadata.type === 'folder')
            .map(key => ({
                id: key.name,
                name: key.metadata.folderName,
                path: key.metadata.folderPath,
                parentFolder: key.metadata.parentFolder || '',
                createdAt: key.metadata.createdAt,
                fileCount: key.metadata.fileCount || 0
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // 计算每个文件夹的文件数量
        const fileList = await env.img_url.list();
        const fileCounts = {};
        
        fileList.keys.forEach(key => {
            if (key.metadata && key.metadata.folderPath && !key.name.startsWith('folder_')) {
                const folderPath = key.metadata.folderPath;
                fileCounts[folderPath] = (fileCounts[folderPath] || 0) + 1;
            }
        });
        
        // 更新文件夹的文件数量
        folders.forEach(folder => {
            folder.fileCount = fileCounts[folder.path] || 0;
        });
        
        console.log('Retrieved folders:', folders.length);
        
        return new Response(JSON.stringify(folders), {
            headers: { 'Content-Type': 'application/json' },
        });
        
    } catch (error) {
        console.error('Get folders error:', error);
        return new Response(JSON.stringify([]), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
