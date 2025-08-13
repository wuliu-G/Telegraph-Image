// Copyright (c) 2025 左岚. All rights reserved.
export async function onRequest(context) {
    const { request, env } = context;
    
    try {
        const url = new URL(request.url);
        const folderName = url.searchParams.get('folderName');
        const parentFolder = url.searchParams.get('parentFolder') || '';
        
        if (!folderName) {
            return new Response(JSON.stringify({ success: false, error: '文件夹名称不能为空' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // 验证文件夹名称
        if (folderName.length > 50) {
            return new Response(JSON.stringify({ success: false, error: '文件夹名称不能超过50个字符' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // 构建完整路径
        const fullPath = parentFolder ? `${parentFolder}/${folderName}` : folderName;
        const folderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 检查文件夹是否已存在
        const existingFolders = await env.img_url.list({ prefix: 'folder_' });
        const folderExists = existingFolders.keys.some(key => {
            const metadata = key.metadata;
            return metadata && metadata.folderPath === fullPath;
        });
        
        if (folderExists) {
            return new Response(JSON.stringify({ success: false, error: '文件夹已存在' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // 创建文件夹元数据
        const folderMetadata = {
            type: 'folder',
            folderName: folderName,
            folderPath: fullPath,
            parentFolder: parentFolder,
            createdAt: Date.now(),
            fileCount: 0
        };
        
        // 保存文件夹信息
        await env.img_url.put(folderId, '', { metadata: folderMetadata });
        
        console.log('Created folder:', folderMetadata);
        
        return new Response(JSON.stringify({ 
            success: true, 
            folderId: folderId,
            folderPath: fullPath 
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
        
    } catch (error) {
        console.error('Create folder error:', error);
        return new Response(JSON.stringify({ success: false, error: '创建文件夹失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
