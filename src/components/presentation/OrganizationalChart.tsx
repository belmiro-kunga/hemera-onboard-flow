import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Building2,
  MapPin
} from 'lucide-react';
import { OrganizationalChartNode } from '@/hooks/useCompanyPresentation';

interface OrganizationalChartProps {
  nodes: OrganizationalChartNode[];
  highlightUser?: boolean;
  interactive?: boolean;
  currentUserId?: string;
}

interface NodeCardProps {
  node: OrganizationalChartNode;
  isHighlighted?: boolean;
  onNodeClick?: (node: OrganizationalChartNode) => void;
  level: number;
}

const NodeCard: React.FC<NodeCardProps> = ({ 
  node, 
  isHighlighted = false, 
  onNodeClick,
  level 
}) => {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const [showDetails, setShowDetails] = useState(false);

  const hasChildren = node.children && node.children.length > 0;

  const handleCardClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
    setShowDetails(!showDetails);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <Card 
        className={`
          relative transition-all duration-300 hover:shadow-lg cursor-pointer
          ${isHighlighted 
            ? 'ring-2 ring-primary bg-primary/5 shadow-glow' 
            : 'hover:scale-105'
          }
          ${level === 0 ? 'w-64' : level === 1 ? 'w-56' : 'w-48'}
        `}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className={level === 0 ? 'h-12 w-12' : 'h-10 w-10'}>
              <AvatarImage src={node.photo_url} alt={node.name} />
              <AvatarFallback>
                {node.photo_url ? getInitials(node.name) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-foreground truncate ${
                level === 0 ? 'text-base' : 'text-sm'
              }`}>
                {node.name}
              </h3>
              <p className={`text-muted-foreground truncate ${
                level === 0 ? 'text-sm' : 'text-xs'
              }`}>
                {node.position}
              </p>
              {node.department && (
                <div className="flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {node.department}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isHighlighted && (
            <Badge variant="default" className="absolute -top-2 -right-2 text-xs">
              Você
            </Badge>
          )}

          {/* Expanded Details */}
          {showDetails && node.bio && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {node.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expand/Collapse Button */}
      {hasChildren && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-2 mb-4 h-8 w-8 rounded-full border bg-card shadow-sm"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Connection Line */}
      {hasChildren && expanded && (
        <div className="w-px h-6 bg-border" />
      )}

      {/* Children */}
      {hasChildren && expanded && (
        <div className="relative">
          {/* Horizontal Line */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-full h-px bg-border" />
          
          {/* Children Grid */}
          <div className={`
            grid gap-8 pt-6
            ${node.children!.length === 1 ? 'grid-cols-1' : 
              node.children!.length === 2 ? 'grid-cols-2' : 
              node.children!.length <= 4 ? 'grid-cols-2 lg:grid-cols-4' :
              'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }
          `}>
            {node.children!.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Vertical Line to Child */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-px h-6 bg-border" />
                
                <NodeCard
                  node={child}
                  isHighlighted={false} // You can implement user highlighting logic here
                  onNodeClick={onNodeClick}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrganizationalChart: React.FC<OrganizationalChartProps> = ({
  nodes,
  highlightUser = false,
  interactive = true,
  currentUserId
}) => {
  const [selectedNode, setSelectedNode] = useState<OrganizationalChartNode | null>(null);

  const handleNodeClick = (node: OrganizationalChartNode) => {
    if (interactive) {
      setSelectedNode(selectedNode?.id === node.id ? null : node);
    }
  };

  if (!nodes || nodes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Organograma não disponível
          </h3>
          <p className="text-muted-foreground">
            O organograma da empresa ainda não foi configurado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Organizational Chart */}
      <div className="overflow-x-auto pb-8">
        <div className="min-w-max p-8">
          {nodes.map(rootNode => (
            <NodeCard
              key={rootNode.id}
              node={rootNode}
              isHighlighted={highlightUser && rootNode.id === currentUserId}
              onNodeClick={handleNodeClick}
              level={0}
            />
          ))}
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <Card className="mt-6 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedNode.photo_url} alt={selectedNode.name} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {selectedNode.name}
                </h3>
                <p className="text-lg text-primary font-medium mb-2">
                  {selectedNode.position}
                </p>
                
                {selectedNode.department && (
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {selectedNode.department}
                    </span>
                  </div>
                )}

                {selectedNode.bio && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-foreground mb-2">Sobre</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedNode.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="mt-6 flex justify-center">
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Sua posição</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span>Clique para expandir/recolher</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { OrganizationalChart };