// Copyright (c) 2025 左岚. All rights reserved.
export async function onRequest(context) {
    const { params, env } = context;
    
    try {
        console.log("Deleting folder:", params.id);
        
        // 获取文件夹信息
        const folderData = await env.img_url.getWithMetadata(params.id);
        
        if (!folderData || !folderData.metadata || folderData.metadata.type !== 'folder') {
            return new Response(JSON.stringify({ success: false, error: '文件夹不存在' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const folderPath = folderData.metadata.folderPath;
        
        // 检查文件夹是否为空
        const fileList = await env.img_url.list();
        const filesInFolder = fileList.keys.filter(key => {
            return key.metadata && 
                   key.metadata.folderPath === folderPath && 
                   !key.name.startsWith('folder_');
        });
        
        if (filesInFolder.length > 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: `文件夹不为空，包含 ${filesInFolder.length} 个文件` 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // 删除文件夹
        await env.img_url.delete(params.id);
        
        console.log('Folder deleted successfully:', folderPath);
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
        
    } catch (error) {
        console.error('Delete folder error:', error);
        return new Response(JSON.stringify({ success: false, error: '删除文件夹失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
